# Sitewide Copy Rewrite — Senior Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite positioning copy across the English locale and one hardcoded stat so the site reads as senior-level work, without changing visual design.

**Architecture:** Pure content changes. 22 key edits in `src/locales/en.json` (one EN locale file), plus a single hardcoded JSX value change in `AboutContent.tsx` (stat card label and number swap). No component refactors, no layout changes, no new files. Strategy is "claim-light, artifact-dense" — every sentence carries a named artifact or a measured number. Design spec: `docs/superpowers/specs/2026-04-21-copy-rewrite-senior-positioning-design.md`.

**Tech Stack:** Next.js 14, next-intl 4, TypeScript, Jest, Playwright. Locale files are plain JSON; no codegen step.

**DE locale out of scope (per spec).** `src/locales/de.json` has parallel issues but translation is handled in a follow-up plan once EN ships and is reviewed.

---

## File structure

| File | Change type | Responsibility |
|---|---|---|
| `src/locales/en.json` | modify (22 keys across 6 pages) | all English positioning copy |
| `src/app/[locale]/(main)/about/AboutContent.tsx` | modify line 38 only | swap hardcoded `9+` stat value to `4` |

No new files. No deletions. No structural changes.

---

## Task 1: Establish green baseline

**Files:** none (read-only verification)

- [ ] **Step 1: Confirm working tree is clean**

Run: `git status`
Expected: clean working tree on `main` (or current branch). If there are uncommitted changes, stop and resolve with user — do not mix other work into this rewrite.

- [ ] **Step 2: Run type check**

Run: `npm run type-check`
Expected: exit code 0, no errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: exit code 0, no errors or at worst only pre-existing warnings. If new errors appear, stop — the baseline is not clean.

- [ ] **Step 4: Run unit tests**

Run: `npm test -- --passWithNoTests`
Expected: all tests pass (or no tests matched, which is acceptable). Note any flaky or timing-out tests for later comparison.

- [ ] **Step 5: Grep current state to confirm we're editing the right strings**

Run:
```bash
grep -c "25x fewer tokens" src/locales/en.json
grep -c "Agentic Workflows" src/locales/en.json
grep -c "9+" src/app/[locale]/\(main\)/about/AboutContent.tsx
grep -c "Seamless process" src/locales/en.json
```
Expected: `1` on each (these are the confirmed targets).

No commit. This task establishes baseline only.

---

## Task 2: Rewrite landing page copy (`home.*`)

**Files:**
- Modify: `src/locales/en.json` (8 keys under `home`)

- [ ] **Step 1: Update `home.metaDesc`**

Edit `src/locales/en.json`:

OLD:
```json
    "metaDesc": "Senior Product Engineer shipping end-to-end — from Figma to AWS. React, TypeScript, Laravel, Supabase, Terraform.",
```

NEW:
```json
    "metaDesc": "Senior Product Engineer. Full lifecycle across multiple shipped products. Published vlm-code-context-mcp — MCP server for AI agents, benchmark-verified. React, Vue, TypeScript, Laravel, Terraform, AWS/Azure.",
```

- [ ] **Step 2: Update `home.subtitleSecondary`**

OLD:
```json
    "subtitleSecondary": "Full-Stack · Agentic Workflows · Infrastructure",
```

NEW:
```json
    "subtitleSecondary": "Full-Stack · Infrastructure · Agent Tooling",
```

- [ ] **Step 3: Update `home.description`**

OLD:
```json
    "description": "I ship products end-to-end. Over 9 years I've moved from frontend specialist to owning the full lifecycle — from Figma to React, Vue, Node.js, Laravel, and cloud deployment. I now bring that same depth to agentic workflows and context engineering, building open-source MCP tooling for AI-driven development.",
```

NEW:
```json
    "description": "Full lifecycle — requirements → UX → frontend → backend → infrastructure. Shipped at GALVANY (lead-matching engine, 3-4× faster assignment), DEMOS (civic-tech platform, Vue + OpenLayers), and bewerbermappe.com (press: BILD, Die Zeit, n-tv). Open source: vlm-code-context-mcp on npm.",
```

- [ ] **Step 4: Update `home.highlightTitle`**

OLD:
```json
    "highlightTitle": "Context engineering, shipped. One npm package.",
```

NEW:
```json
    "highlightTitle": "MCP server for AI coding agents.",
```

- [ ] **Step 5: Update `home.highlightDesc`**

OLD:
```json
    "highlightDesc": "vlm-code-context-mcp — an MCP server that turns codebases into structured context for AI agents. 25x fewer tokens, 81 tools, built-in scrum team with sprints, retros & live dashboard.",
```

NEW:
```json
    "highlightDesc": "81 tools. Adversarial benchmark across 9 coding tasks → ~44% median token reduction (range 24-91%, tested against raw codebase context). Persistent sprint/retro memory so agents learn from past work.",
```

- [ ] **Step 6: Update `home.personQuote`**

OLD:
```json
    "personQuote": "Good products don't start with code, but with understanding the business. I analyze requirements, translate them into UX/UI concepts, and own the technical execution from architecture to deployment. My goal:",
```

NEW:
```json
    "personQuote": "Products don't start with code — they start with the business problem. I work the full stretch from stakeholder interview to production deployment, because the handoffs in between are where good products become mediocre ones.",
```

- [ ] **Step 7: Update `home.personQuoteHighlight`**

OLD:
```json
    "personQuoteHighlight": "Seamless process with modern tools.",
```

NEW:
```json
    "personQuoteHighlight": "No silos, no translation losses.",
```

- [ ] **Step 8: Update `home.servicesDesc`**

OLD:
```json
    "servicesDesc": "From requirements engineering to UX/UI design to deployment with Next.js, Supabase, and Vercel.",
```

NEW:
```json
    "servicesDesc": "Requirements → UX/UI → shipped product. Stack fits the job: Next.js, Vue/Nuxt, Laravel, Supabase, Vercel, AWS/Azure.",
```

- [ ] **Step 9: Grep verify forbidden strings are gone from `home.*`**

Run:
```bash
grep -n "25x\|Agentic Workflows\|Seamless process\|Context engineering, shipped\|Over 9 years\|ship products end-to-end" src/locales/en.json
```
Expected: no output for any of these strings within the `home` block. If any remain, re-edit until gone.

- [ ] **Step 10: Grep verify new strings are present**

Run:
```bash
grep -c "Adversarial benchmark across 9 coding tasks" src/locales/en.json
grep -c "No silos, no translation losses" src/locales/en.json
grep -c "MCP server for AI coding agents" src/locales/en.json
grep -c "Agent Tooling" src/locales/en.json
```
Expected: each returns `1` or more.

- [ ] **Step 11: Verify JSON is still valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/locales/en.json', 'utf8'))"`
Expected: no output, exit code 0. If parse error, fix trailing comma or quote issue.

- [ ] **Step 12: Type check + tests still pass**

Run: `npm run type-check && npm test -- --passWithNoTests`
Expected: both exit 0.

- [ ] **Step 13: Commit**

```bash
git add src/locales/en.json
git commit -m "copy(home): replace marketing claims with named artifacts and benchmark receipts"
```

---

## Task 3: Rewrite about page copy (`about.*`) and stat card

**Files:**
- Modify: `src/locales/en.json` (5 keys under `about`)
- Modify: `src/app/[locale]/(main)/about/AboutContent.tsx` line 38 (hardcoded `9+` → `4`)

- [ ] **Step 1: Update `about.metaDesc`**

Edit `src/locales/en.json`:

OLD:
```json
    "metaDesc": "9+ years from frontend specialist to full-stack product engineer. React, Vue, TypeScript, Laravel, AWS, Azure.",
```

NEW:
```json
    "metaDesc": "Senior Product Engineer. Multiple roles across civic-tech, rental-tech, and a funded lead-intelligence startup. React, Vue, TypeScript, Laravel, Terraform, AWS/Azure.",
```

- [ ] **Step 2: Update `about.bio1After`**

OLD:
```json
    "bio1After": "who owns products end-to-end. From requirements analysis and UX conception in Figma through modern frontend architectures with React, Vue, Next.js, and Nuxt to cloud infrastructure and agentic AI workflows.",
```

NEW:
```json
    "bio1After": "working the full stretch from stakeholder interview to production deployment. Frontend: React, Vue, Next.js, Nuxt. Backend: Laravel, Quarkus, FastAPI, Node. Infra: Terraform on AWS/Azure, CI/CD with GitHub Actions.",
```

- [ ] **Step 3: Update `about.bio2`**

OLD:
```json
    "bio2": "On the backend I work with Laravel, FastAPI, and Quarkus, with PostgreSQL and Supabase as the database layer. I know the full stack and pragmatically choose the right tool for the job. Beyond using AI daily for development, I build open-source MCP tooling for context engineering — turning codebases into structured context that AI agents can actually work with.",
```

NEW:
```json
    "bio2": "Beyond using AI in my daily development, I build tooling for it. vlm-code-context-mcp on npm is an MCP server that gives AI coding agents structured access to codebases — 81 tools, ~44% median token reduction on an adversarial 9-task benchmark, persistent sprint/retro memory so agents learn from past work.",
```

- [ ] **Step 4: Update `about.bio3`**

OLD:
```json
    "bio3": "With experience from startups, mid-sized companies, and corporations, I combine technical depth with entrepreneurial thinking. I don't just build features — I build products that make a difference.",
```

NEW:
```json
    "bio3": "Experience across a corporate (Zalando), a mid-sized civic-tech SaaS (DEMOS), and two startups (Housy/bewerbermappe.com, GALVANY). I care about what happens after deployment — what shipped, what changed for users, what the metrics show next sprint.",
```

- [ ] **Step 5: Update `about.yearsExp`** (stat card label)

OLD:
```json
    "yearsExp": "Years Experience",
```

NEW:
```json
    "yearsExp": "Shipped Products",
```

- [ ] **Step 6: Update the hardcoded stat value in `AboutContent.tsx`**

Edit `src/app/[locale]/(main)/about/AboutContent.tsx` line 38:

OLD:
```tsx
                 <div className="text-2xl font-mono font-bold text-black dark:text-white">9+</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest">{t('about.yearsExp')}</div>
```

NEW:
```tsx
                 <div className="text-2xl font-mono font-bold text-black dark:text-white">4</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest">{t('about.yearsExp')}</div>
```

(Only the `9+` → `4` changes. The next line stays identical — it renders the translated label, which we updated in Step 5.)

- [ ] **Step 7: Grep verify forbidden strings are gone from `about.*`**

Run:
```bash
grep -n "9+ years\|Years Experience\|owns products end-to-end\|I know the full stack\|agentic AI workflows\|products that make a difference" src/locales/en.json
grep -n "\"9+\"" src/app/\[locale\]/\(main\)/about/AboutContent.tsx
grep -n ">9+<" src/app/\[locale\]/\(main\)/about/AboutContent.tsx
```
Expected: no output (all gone). If any remain, re-edit.

- [ ] **Step 8: Grep verify new strings are present**

Run:
```bash
grep -c "Shipped Products" src/locales/en.json
grep -c "Multiple roles across civic-tech" src/locales/en.json
grep -c "working the full stretch" src/locales/en.json
grep -c ">4<" src/app/\[locale\]/\(main\)/about/AboutContent.tsx
```
Expected: each returns `1` or more.

- [ ] **Step 9: JSON validity + type check + tests**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('src/locales/en.json', 'utf8'))"
npm run type-check
npm test -- --passWithNoTests
```
Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add src/locales/en.json src/app/\[locale\]/\(main\)/about/AboutContent.tsx
git commit -m "copy(about): swap years-experience tenure claim for shipped-products stat, rewrite bio paragraphs"
```

---

## Task 4: Fix German-in-English bug (`services.heroDescAfter`)

**Files:**
- Modify: `src/locales/en.json` (1 key)

- [ ] **Step 1: Update `services.heroDescAfter`**

Edit `src/locales/en.json`:

OLD:
```json
    "heroDescAfter": ", in UX/UI übersetzen, das Branding mitdenken und mit modernem Stack wie Next.js, Vue, Nuxt, Node.js, Laravel, Quarkus, Supabase und Vercel umsetzen – bis zum Deployment.",
```

NEW:
```json
    "heroDescAfter": ", translated into UX/UI, woven into the brand, and built with a modern stack — Next.js, Vue, Nuxt, Node.js, Laravel, Quarkus, Supabase, Vercel — through to deployment.",
```

- [ ] **Step 2: Grep verify German fragment is gone**

Run:
```bash
grep -n "übersetzen\|mitdenken\|umsetzen" src/locales/en.json
```
Expected: no output (German words should not appear in the EN locale).

- [ ] **Step 3: Grep verify new English phrase is present**

Run:
```bash
grep -c "translated into UX/UI, woven into the brand" src/locales/en.json
```
Expected: `1`.

- [ ] **Step 4: JSON validity + type check**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('src/locales/en.json', 'utf8'))"
npm run type-check
```
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/locales/en.json
git commit -m "copy(services): fix German text leaked into English locale"
```

---

## Task 5: Rewrite MCP project card and soften arcade fps claim (`projects.*`)

**Files:**
- Modify: `src/locales/en.json` (5 keys under `projects`)

- [ ] **Step 1: Update `projects.mcp.desc`**

Edit `src/locales/en.json`:

OLD:
```json
      "desc": "Live demo of vlm-code-context-mcp: an MCP server that turns codebases into structured context for AI agents. Sprint board, Kanban, team management, retros — all powered by 81 tools and a SQLite-backed context engine.",
```

NEW:
```json
      "desc": "MCP server that gives AI coding agents structured access to codebases. 81 tools, adversarially benchmarked across 9 tasks (retrieval, analysis, exploration, implementation, debugging, refactoring). Persistent sprint/retro memory.",
```

- [ ] **Step 2: Update `projects.mcp.solution`**

OLD:
```json
      "solution": "Built an MCP server backed by SQLite that indexes codebases into structured context. 81 tools covering file search, sprint management, retros, and team workflows — all through a single npm package.",
```

NEW:
```json
      "solution": "Built an MCP server backed by SQLite that indexes codebases into structured context. Benchmarked adversarially against raw-codebase context — ~44% median token reduction, 24-91% range across 9 task types. 81 tools covering file search, sprint management, retros, and team workflows.",
```

- [ ] **Step 3: Update `projects.mcp.impact1Value` and `impact1Label`**

OLD:
```json
      "impact1Value": "25x",
      "impact1Label": "Fewer Tokens",
```

NEW:
```json
      "impact1Value": "44%",
      "impact1Label": "Median Token Reduction",
```

- [ ] **Step 4: Update `projects.mcp.impact3Value` and `impact3Label`**

OLD:
```json
      "impact3Value": "1",
      "impact3Label": "npm Package",
```

NEW:
```json
      "impact3Value": "9",
      "impact3Label": "Benchmark Tasks",
```

- [ ] **Step 5: Update `projects.arcade.impact2Value` and `impact2Label`**

OLD:
```json
      "impact2Value": "60fps",
      "impact2Label": "In Browser",
```

NEW:
```json
      "impact2Value": "Bevy",
      "impact2Label": "Engine",
```

- [ ] **Step 6: Grep verify forbidden strings are gone**

Run:
```bash
grep -n "\"25x\"\|\"60fps\"\|\"Fewer Tokens\"" src/locales/en.json
```
Expected: no output.

- [ ] **Step 7: Grep verify new strings are present**

Run:
```bash
grep -c "Median Token Reduction" src/locales/en.json
grep -c "Benchmark Tasks" src/locales/en.json
grep -c "\"Bevy\"" src/locales/en.json
grep -c "adversarially benchmarked across 9 tasks" src/locales/en.json
```
Expected: each returns `1`.

- [ ] **Step 8: JSON validity + type check + tests**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('src/locales/en.json', 'utf8'))"
npm run type-check
npm test -- --passWithNoTests
```
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/locales/en.json
git commit -m "copy(projects): replace 25x marketing claim with 44% benchmark receipt, soften arcade fps claim"
```

---

## Task 6: Tighten contact intro and fix typo (`contact.intro`)

**Files:**
- Modify: `src/locales/en.json` (1 key)

- [ ] **Step 1: Update `contact.intro`**

Edit `src/locales/en.json`:

OLD:
```json
    "intro": "Open for projects and roles where I own the full product lifecycle — from requirements analysis through UX/UI design to full-stack development with React, Vue, Node.js, Laravel, Quarkus to and cloud deployment.",
```

NEW:
```json
    "intro": "Open for product-engineering roles where the brief runs from requirements through UX, frontend (React, Vue, Next.js, Nuxt), backend (Laravel, Node, Quarkus), to Terraform-managed cloud deployment. Contract or full-time.",
```

- [ ] **Step 2: Grep verify typo and old phrasing gone**

Run:
```bash
grep -n "to and cloud deployment\|own the full product lifecycle" src/locales/en.json
```
Expected: no output.

- [ ] **Step 3: Grep verify new phrasing present**

Run:
```bash
grep -c "Terraform-managed cloud deployment" src/locales/en.json
grep -c "Contract or full-time" src/locales/en.json
```
Expected: each returns `1`.

- [ ] **Step 4: JSON validity + type check**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('src/locales/en.json', 'utf8'))"
npm run type-check
```
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/locales/en.json
git commit -m "copy(contact): tighten intro and fix 'to and cloud deployment' typo"
```

---

## Task 7: Sync footer secondary tagline (`footer.taglineSecondary`)

**Files:**
- Modify: `src/locales/en.json` (1 key)

- [ ] **Step 1: Update `footer.taglineSecondary`**

Edit `src/locales/en.json`:

OLD:
```json
    "taglineSecondary": "Full-Stack · Agentic Workflows · Infrastructure.",
```

NEW:
```json
    "taglineSecondary": "Full-Stack · Infrastructure · Agent Tooling.",
```

- [ ] **Step 2: Grep verify old phrasing gone across entire EN locale**

Run:
```bash
grep -n "Agentic Workflows" src/locales/en.json
```
Expected: no output. (This was the last instance — landing was updated in Task 2.)

- [ ] **Step 3: Grep verify new phrasing present in footer**

Run:
```bash
grep -c "Full-Stack · Infrastructure · Agent Tooling" src/locales/en.json
```
Expected: `2` (one in `home.subtitleSecondary`, one in `footer.taglineSecondary` — they should match).

- [ ] **Step 4: JSON validity + type check**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('src/locales/en.json', 'utf8'))"
npm run type-check
```
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/locales/en.json
git commit -m "copy(footer): sync secondary tagline with landing subtitle"
```

---

## Task 8: Final verification sweep

**Files:** none modified (verification only)

- [ ] **Step 1: Sitewide grep — confirm all forbidden strings eliminated**

Run:
```bash
echo "=== FORBIDDEN STRINGS CHECK ==="
for pattern in "25x fewer tokens" "Agentic Workflows" "Seamless process" "9+ years" "Years Experience" "Context engineering, shipped" "products that make a difference" "Over 9 years" "Fewer Tokens" "60fps" "owns products end-to-end" "to and cloud deployment" "übersetzen" "mitdenken"; do
  count=$(grep -c "$pattern" src/locales/en.json 2>/dev/null || echo 0)
  echo "EN '$pattern': $count occurrences"
done
grep -c "9+" src/app/\[locale\]/\(main\)/about/AboutContent.tsx || echo "AboutContent.tsx '9+': 0 occurrences"
```
Expected: every count is `0` for the EN locale file. (The DE file will still have these — out of scope for this plan.)

- [ ] **Step 2: Sitewide grep — confirm new receipts are consistent**

Run:
```bash
echo "=== NEW RECEIPTS PRESENCE CHECK ==="
grep -c "44%" src/locales/en.json
grep -c "Adversarial benchmark" src/locales/en.json
grep -c "adversarially benchmarked" src/locales/en.json
grep -c "bewerbermappe" src/locales/en.json
grep -c "Agent Tooling" src/locales/en.json
```
Expected:
- `44%`: at least `3` (landing description, landing highlightDesc, about bio2, projects mcp.solution, projects mcp.impact1Value — likely 4-5)
- `Adversarial benchmark` + `adversarially benchmarked` combined: at least `3`
- `bewerbermappe`: multiple occurrences (landing + projects page already)
- `Agent Tooling`: `2` (home.subtitleSecondary + footer.taglineSecondary)

- [ ] **Step 3: Run full type check**

Run: `npm run type-check`
Expected: exit 0, no errors.

- [ ] **Step 4: Run full lint**

Run: `npm run lint`
Expected: exit 0, no new warnings or errors vs. the baseline from Task 1.

- [ ] **Step 5: Run unit test suite**

Run: `npm test -- --passWithNoTests`
Expected: all tests pass. If any test that references copy (e.g., testing button text or page headings) now fails, update the test assertion to match the new copy — do NOT revert the copy change.

- [ ] **Step 6: Build the app to confirm no runtime/parse issues**

Run: `npm run build`
Expected: successful Next.js build, no errors.

- [ ] **Step 7: Spot-check the rendered pages in the dev server**

Run the dev server manually (NOT as a step to automate — this is a human verification):
```bash
npm run dev
```
Then in a browser:
1. Visit `http://localhost:3000/en` — confirm the landing hero reads the new `description`, the MCP card shows "81 tools. Adversarial benchmark...", and the person quote ends with "No silos, no translation losses."
2. Visit `http://localhost:3000/en/about` — confirm the stat card shows `4` over `SHIPPED PRODUCTS`.
3. Visit `http://localhost:3000/en/services` — confirm the hero paragraph no longer contains German words ("übersetzen", "mitdenken", "umsetzen").
4. Visit `http://localhost:3000/en/projects` — confirm the MCP card shows `44%` over "MEDIAN TOKEN REDUCTION", and the arcade card shows `Bevy` over "ENGINE".
5. Visit `http://localhost:3000/en/contact` — confirm the intro reads the new "Open for product-engineering roles…".
6. Confirm dark mode toggle still works and the stat card numbers are readable in both modes.

Stop the dev server after verification (`Ctrl+C`).

- [ ] **Step 8: Run Playwright E2E tests if they exist for the relevant pages**

Run: `npm run test:e2e`
Expected: tests pass. If any test fails because it asserted against the old copy, update the test to match the new copy.

If the tests include visual regression snapshots for home/about/projects, snapshots will likely need updating due to text changes:
```bash
npx playwright test --config=playwright.config.ts --update-snapshots
```
Then review the updated snapshots in `playwright-report/` before accepting.

- [ ] **Step 9: If snapshots were updated, commit them separately**

```bash
git add test-results/ playwright-report/ **/*-snapshots/**
git commit -m "test: update visual snapshots for copy rewrite"
```
(Only run this step if snapshots changed. If no visual regression tests cover these pages, skip.)

- [ ] **Step 10: Final confirmation**

Run: `git log --oneline -10`
Expected output: 6 new `copy(...)` commits from Tasks 2-7 (and optionally a `test: update visual snapshots` commit), plus prior history. Review the commit list to confirm all pages are represented.

---

## Self-review checklist (already applied during plan writing)

**Spec coverage:**
- `home.*` Tier 1 rewrites → Task 2 ✓
- `home.*` Tier 2 polish (`subtitleSecondary`, `servicesDesc`) → Task 2 ✓
- `about.*` rewrites + `9+` stat swap → Task 3 ✓
- `services.heroDescAfter` bug → Task 4 ✓
- `projects.mcp.*` rewrites + `arcade.impact2` soften → Task 5 ✓
- `contact.intro` rewrite + typo → Task 6 ✓
- `footer.taglineSecondary` sync → Task 7 ✓
- Final grep audit, build, test → Task 8 ✓

**Placeholder scan:** No "TBD", "TODO", or "handle appropriately" in any task. All edits show complete OLD/NEW strings.

**Type consistency:** All edits target `src/locales/en.json` and one hardcoded value in `AboutContent.tsx`. Translation key names (e.g. `yearsExp`) remain identical — only the value (label text) changes, so `t('about.yearsExp')` still resolves correctly in the JSX.

**Out of scope correctly excluded:** DE locale (`src/locales/de.json`) explicitly deferred per spec; no tasks touch it. Visual design unchanged (no component/CSS edits besides the single hardcoded stat value).
