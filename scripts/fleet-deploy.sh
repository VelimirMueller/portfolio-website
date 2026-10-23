#!/usr/bin/env bash
# Deploy command of deploy.yml and promote.yml. The site deploys through the Vercel Git
# integration (every push to main goes to production), not through Actions (fleet.yml). Stop
# with an error, so a dispatch never reports a deploy that did not happen and never starts a
# second deploy path next to Vercel's.
set -euo pipefail
echo "::error::portfolio-website deploys through the Vercel Git integration, not this workflow (fleet.yml)"
exit 1
