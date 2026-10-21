#!/usr/bin/env bash
# Applies supabase/migrations to a fresh local database and runs supabase/tests/*.sql.
# Local only: Docker, psql and the Supabase CLI. It never links or pushes to the
# hosted project. Used by CI (job "Database Migrations & SQL Tests").
#
#   pnpm run test:db              start the local database, migrate, test
#   KEEP_DB=1 pnpm run test:db    leave the database running afterwards
#
# Steps:
#   1. Start only Postgres, without migrations.
#   2. Reset to the last migration before magic_v2 and load the catalog fixture
#      (magic_v2 refuses to run on an empty catalog).
#   3. Apply the remaining migrations.
#   4. Put a dummy contact_hook_secret in Vault, as on production.
#   5. Run every SQL test with ON_ERROR_STOP; then check that no HTTP request was queued.
set -euo pipefail

cd "$(dirname "$0")/../.."

# The CLI from devDependencies (pnpm install), else the one on PATH (CI installs the same
# version with supabase/setup-cli).
if [[ -x node_modules/.bin/supabase ]]; then SUPABASE=(node_modules/.bin/supabase); else SUPABASE=(supabase); fi
# The migration right before magic_v2: the catalog fixture loads after it.
MAGIC_V2=20261008150000_magic_v2.sql
[[ -f supabase/migrations/$MAGIC_V2 ]] || { echo "supabase/migrations/$MAGIC_V2 is missing" >&2; exit 1; }
BEFORE_CATALOG="$(find supabase/migrations -name '*.sql' -exec basename {} \; | sort | awk -v v2="$MAGIC_V2" '$0 < v2 { last = $0 } END { print substr(last, 1, 14) }')"
[[ -n "$BEFORE_CATALOG" ]] || { echo "No migration before $MAGIC_V2" >&2; exit 1; }
# Every container except the database. The tests need Postgres only.
EXCLUDE=gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor

# shellcheck disable=SC2329 # invoked by the EXIT trap
cleanup() {
  if [[ "${KEEP_DB:-}" != "1" ]]; then
    "${SUPABASE[@]}" stop --no-backup >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "::group::Start the local database"
"${SUPABASE[@]}" stop --no-backup >/dev/null 2>&1 || true
SUPABASE_DB_MIGRATIONS_ENABLED=false "${SUPABASE[@]}" start --exclude "$EXCLUDE"
DB_URL="$("${SUPABASE[@]}" status --output env | sed -n 's/^DB_URL="\(.*\)"$/\1/p')"
[[ -n "$DB_URL" ]] || { echo "No DB_URL from supabase status" >&2; exit 1; }
echo "::endgroup::"

psql_run() { psql "$DB_URL" --no-psqlrc --quiet -v ON_ERROR_STOP=1 "$@"; }

echo "::group::Migrations up to $BEFORE_CATALOG, then the catalog fixture"
"${SUPABASE[@]}" db reset --local --no-seed --version "$BEFORE_CATALOG"
psql_run -f supabase/tests/fixtures/catalog.sql
echo "::endgroup::"

echo "::group::Remaining migrations"
"${SUPABASE[@]}" migration up --local
echo "::endgroup::"

# Dummy value: the hook sends nothing here (tests roll back, pg_net sends committed
# requests only), and the check at the end proves it.
psql_run -c "select vault.create_secret('ci-dummy-not-a-secret', 'contact_hook_secret', 'CI dummy')" >/dev/null

failed=0
for test in supabase/tests/*.sql; do
  echo "::group::$test"
  if psql_run --output=/dev/null -f "$test"; then
    echo "::endgroup::"
    echo "PASS $test"
  else
    echo "::endgroup::"
    echo "::error file=$test::SQL test failed"
    failed=1
  fi
done

queued="$(psql_run -Atc "select (select count(*) from net.http_request_queue) + (select count(*) from net._http_response)")"
if [[ "$queued" != "0" ]]; then
  echo "::error::$queued HTTP request(s) were queued by pg_net; tests must not send requests"
  failed=1
fi

exit "$failed"
