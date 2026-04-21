# Sitewide Copy Rewrite — Senior Positioning

**Date:** 2026-04-21
**Scope:** Positioning copy across `src/locales/en.json`, plus one hardcoded stat in `src/app/[locale]/(main)/about/AboutContent.tsx`
**Goal:** Rewrite positioning copy so the site reads as senior-level work. Keep the visual design untouched.

---

## Problem

A debate agent pointed at the landing page concluded "capable mid-level developer with genuine shipping experience and real breadth." The verdict attacked presentation, not capability — specifically: undocumented claims, inflated framing, and quantified assertions without methodology (e.g. "25× fewer tokens", "first-principles reasoning"). The site under-represents the user's actual work.

## Strategy

**Approach: Claim-light, artifact-dense (evaluated against two alternatives — evidence-first with inline anchors, and verbs-over-adjectives — and selected).**

Core rule: every sentence carries a name (product, company, tool) or a number (measured outcome). Nothing floats. Adjectives are removed unless they're load-bearing. Marketing phrasing ("end-to-end", "seamless process", "make a difference") is replaced with specific scope boundaries or verifiable outcomes.

The debate agent's attack vector — "claims float" — closes by construction: readers skeptical of any single claim can trace it to a named product, a benchmark, or a press feature.

## Claims audit

| # | Claim | Status | Action |
|---|---|---|---|
| 1 | 81 tools | SOLID | keep |
| 2 | 3-4× faster lead assignment (GALVANY) | SOLID | keep, surface on landing |
| 3 | ~6% → 11% predicted conversion (GALVANY) | SOFTEN | keep phrasing but leave in About only |
| 4 | 9+ years experience | SOFTEN | drop the number sitewide; replace with "multiple roles" framings |
| 5 | 100% Custom CSS/SVG, 0 External Chart Deps (dashboard) | SOLID | keep |
| 6 | 60fps in browser (arcade) | SOFTEN | replace with `Bevy` / "Engine" |
| 7 | 3+ press features (bewerbermappe) | SOLID | keep |
| 8 | 25× fewer tokens (MCP) | DROP (approximation) | replace with 44% median from real benchmark |

### Benchmark methodology (new receipt)

The replacement for "25×" is an adversarial benchmark the user built after having Claude argue with a local Gemma 3 model about whether the tool actually worked. Result: 9-task benchmark covering retrieval, analysis, exploration, implementation, debugging, and refactoring — weighted 1-5pt by complexity. Measures two independent metrics (tokens and tool calls). Median ~44% token reduction, range 24-91%.

This gets phrased consistently sitewide as: **"Adversarial benchmark across 9 coding tasks → ~44% median token reduction (range 24-91%, tested against raw codebase context)."**

## Positioning spine

The 2-3 sentences the whole site orbits around. Every page's hero/intro is a compression or expansion of this.

> **Senior Product Engineer.** Full lifecycle — requirements, UX, code, infrastructure. Many years, multiple roles.
>
> **Open source:** `vlm-code-context-mcp` on npm. MCP server for AI coding agents — 81 tools, persistent sprint/retro memory. Adversarial benchmark across 9 coding tasks → ~44% median token reduction.
>
> **Shipped:** Lead-matching engine at GALVANY (Laravel · React · Terraform · AWS/Azure, 3-4× faster assignment). Co-built bewerbermappe.com (press: BILD, Die Zeit, n-tv). Civic-tech platform at DEMOS (Vue, OpenLayers, 3+ years).

---

## Per-key copy deltas

All changes are to `src/locales/en.json` unless noted.

### `home.*` — landing page

**`description`**
```
CURRENT: "I ship products end-to-end. Over 9 years I've moved from frontend specialist to owning the full lifecycle — from Figma to React, Vue, Node.js, Laravel, and cloud deployment. I now bring that same depth to agentic workflows and context engineering, building open-source MCP tooling for AI-driven development."

PROPOSED: "Full lifecycle — requirements → UX → frontend → backend → infrastructure. Shipped at GALVANY (lead-matching engine, 3-4× faster assignment), DEMOS (civic-tech platform, Vue + OpenLayers), and bewerbermappe.com (press: BILD, Die Zeit, n-tv). Open source: vlm-code-context-mcp on npm."
```

**`highlightTitle`**
```
CURRENT: "Context engineering, shipped. One npm package."
PROPOSED: "MCP server for AI coding agents."
```

**`highlightDesc`**
```
CURRENT: "vlm-code-context-mcp — an MCP server that turns codebases into structured context for AI agents. 25x fewer tokens, 81 tools, built-in scrum team with sprints, retros & live dashboard."

PROPOSED: "81 tools. Adversarial benchmark across 9 coding tasks → ~44% median token reduction (range 24-91%, tested against raw codebase context). Persistent sprint/retro memory so agents learn from past work."
```

**`personQuote` + `personQuoteHighlight`**
```
CURRENT: "Good products don't start with code, but with understanding the business. I analyze requirements, translate them into UX/UI concepts, and own the technical execution from architecture to deployment. My goal:" + "Seamless process with modern tools."

PROPOSED: "Products don't start with code — they start with the business problem. I work the full stretch from stakeholder interview to production deployment, because the handoffs in between are where good products become mediocre ones." + "No silos, no translation losses."
```

**`metaDesc`**
```
CURRENT: "Senior Product Engineer shipping end-to-end — from Figma to AWS. React, TypeScript, Laravel, Supabase, Terraform."

PROPOSED: "Senior Product Engineer. Full lifecycle across multiple shipped products. Published vlm-code-context-mcp — MCP server for AI agents, benchmark-verified. React, Vue, TypeScript, Laravel, Terraform, AWS/Azure."
```

**`subtitleSecondary`**
```
CURRENT: "Full-Stack · Agentic Workflows · Infrastructure"
PROPOSED: "Full-Stack · Infrastructure · Agent Tooling"
```

**`servicesDesc`**
```
CURRENT: "From requirements engineering to UX/UI design to deployment with Next.js, Supabase, and Vercel."
PROPOSED: "Requirements → UX/UI → shipped product. Stack fits the job: Next.js, Vue/Nuxt, Laravel, Supabase, Vercel, AWS/Azure."
```

**Keep unchanged:** `metaTitle`, `badge`, `subtitle`, `ctaProjects`, `ctaContact`, `techDna`, `systemStatus`, `operational`, `highlightTag`, `highlightCta`, `thePerson`, `personName`, `personRole`, `servicesLabel`, `servicesTitle`, `allServices`.

---

### `about.*` — about page

**`metaDesc`**
```
CURRENT: "9+ years from frontend specialist to full-stack product engineer. React, Vue, TypeScript, Laravel, AWS, Azure."
PROPOSED: "Senior Product Engineer. Multiple roles across civic-tech, rental-tech, and a funded lead-intelligence startup. React, Vue, TypeScript, Laravel, Terraform, AWS/Azure."
```

**`bio1Bold` + `bio1After`**
```
CURRENT: "Senior Product Engineer" + "who owns products end-to-end. From requirements analysis and UX conception in Figma through modern frontend architectures with React, Vue, Next.js, and Nuxt to cloud infrastructure and agentic AI workflows."

PROPOSED: "Senior Product Engineer" + "working the full stretch from stakeholder interview to production deployment. Frontend: React, Vue, Next.js, Nuxt. Backend: Laravel, Quarkus, FastAPI, Node. Infra: Terraform on AWS/Azure, CI/CD with GitHub Actions."
```

**`bio2`**
```
CURRENT: "On the backend I work with Laravel, FastAPI, and Quarkus, with PostgreSQL and Supabase as the database layer. I know the full stack and pragmatically choose the right tool for the job. Beyond using AI daily for development, I build open-source MCP tooling for context engineering — turning codebases into structured context that AI agents can actually work with."

PROPOSED: "Beyond using AI in my daily development, I build tooling for it. vlm-code-context-mcp on npm is an MCP server that gives AI coding agents structured access to codebases — 81 tools, ~44% median token reduction on an adversarial 9-task benchmark, persistent sprint/retro memory so agents learn from past work."
```

**`bio3`**
```
CURRENT: "With experience from startups, mid-sized companies, and corporations, I combine technical depth with entrepreneurial thinking. I don't just build features — I build products that make a difference."

PROPOSED: "Experience across a corporate (Zalando), a mid-sized civic-tech SaaS (DEMOS), and two startups (Housy/bewerbermappe.com, GALVANY). I care about what happens after deployment — what shipped, what changed for users, what the metrics show next sprint."
```

**`yearsExp`** (stat card label)
```
CURRENT: "Years Experience"
PROPOSED: "Shipped Products"
```

**Code change — `src/app/[locale]/(main)/about/AboutContent.tsx:38`**
```
CURRENT: <div className="text-2xl font-mono font-bold text-black dark:text-white">9+</div>
PROPOSED: <div className="text-2xl font-mono font-bold text-black dark:text-white">4</div>
```

**Keep unchanged:** all other `about.*` keys (experience log, exp1-exp7 descriptions are already well-anchored).

---

### `services.*`

**`heroDescAfter`** (🐛 fixes a bug — German text currently in EN locale)
```
CURRENT: "...in UX/UI übersetzen, das Branding mitdenken und mit modernem Stack wie Next.js, Vue, Nuxt, Node.js, Laravel, Quarkus, Supabase und Vercel umsetzen – bis zum Deployment."

PROPOSED: "...translated into UX/UI, woven into the brand, and built with a modern stack — Next.js, Vue, Nuxt, Node.js, Laravel, Quarkus, Supabase, Vercel — through to deployment."
```

**Keep unchanged:** all other `services.*` and `serviceDetail.*` keys. Service descriptions are appropriately neutral and don't carry the "wicked claims" load.

---

### `projects.*`

**`mcp.impact1Value` + `mcp.impact1Label`**
```
CURRENT: "25x" / "Fewer Tokens"
PROPOSED: "44%" / "Median Token Reduction"
```

**`mcp.impact3Value` + `mcp.impact3Label`**
```
CURRENT: "1" / "npm Package"
PROPOSED: "9" / "Benchmark Tasks"
```

**`mcp.desc`**
```
CURRENT: "Live demo of vlm-code-context-mcp: an MCP server that turns codebases into structured context for AI agents. Sprint board, Kanban, team management, retros — all powered by 81 tools and a SQLite-backed context engine."

PROPOSED: "MCP server that gives AI coding agents structured access to codebases. 81 tools, adversarially benchmarked across 9 tasks (retrieval, analysis, exploration, implementation, debugging, refactoring). Persistent sprint/retro memory."
```

**`mcp.solution`**
```
CURRENT: "Built an MCP server backed by SQLite that indexes codebases into structured context. 81 tools covering file search, sprint management, retros, and team workflows — all through a single npm package."

PROPOSED: "Built an MCP server backed by SQLite that indexes codebases into structured context. Benchmarked adversarially against raw-codebase context — ~44% median token reduction, 24-91% range across 9 task types. 81 tools covering file search, sprint management, retros, and team workflows."
```

**`arcade.impact2Value` + `arcade.impact2Label`**
```
CURRENT: "60fps" / "In Browser"
PROPOSED: "Bevy" / "Engine"
```

**Keep unchanged:** `enterprise`, `saas`, `ml`, `bewerbermappe`, `dashboard` — already artifact-dense with real receipts.

---

### `contact.*`

**`intro`** (also fixes a typo: "to and cloud deployment")
```
CURRENT: "Open for projects and roles where I own the full product lifecycle — from requirements analysis through UX/UI design to full-stack development with React, Vue, Node.js, Laravel, Quarkus to and cloud deployment."

PROPOSED: "Open for product-engineering roles where the brief runs from requirements through UX, frontend (React, Vue, Next.js, Nuxt), backend (Laravel, Node, Quarkus), to Terraform-managed cloud deployment. Contract or full-time."
```

---

### `footer.*`

**`taglineSecondary`** (syncs with landing `subtitleSecondary`)
```
CURRENT: "Full-Stack · Agentic Workflows · Infrastructure."
PROPOSED: "Full-Stack · Infrastructure · Agent Tooling."
```

---

## Scope boundaries

**In scope:**
- `src/locales/en.json` — all deltas above.
- `src/app/[locale]/(main)/about/AboutContent.tsx` — swap hardcoded `9+` to `4`.

**Out of scope (this spec):**
- `src/locales/de.json` — German translation. To be decided after EN changes are reviewed. Translation will mirror the structure 1:1 — the benchmark line, artifact names, and product names stay identical; only surrounding prose gets German treatment.
- Visual design. No component changes, no new sections, no layout shifts. The `AboutContent.tsx` edit is a single-character value change that preserves layout.
- Project pages that already read well (`dashboard`, `arcade` outside impact2, `enterprise`, `saas`, `ml`, `bewerbermappe`) — their descriptions already follow the artifact-dense pattern.

## Open questions (resolve during implementation)

1. **DE translation scope:** Translate all EN deltas to DE in the same implementation pass, or ship EN first and treat DE as a follow-up? Recommendation: same pass — avoids a window where locale files are out of sync. User to confirm before implementation begins.

2. **No automated verification of copy:** Copy changes don't break tests in the standard sense, but they should be visually checked in both light and dark modes, desktop and mobile viewports. Playwright screenshot regression is configured in the project — running that before merge is the cheapest verification.

## Success criteria

- Every sentence on the 5 main pages (home, about, services, projects, contact) carries a name or a number — no floating claims.
- "25×" and "9+ years" appear nowhere sitewide (grep check).
- The German sentence fragment in `services.heroDescAfter` is gone from the EN locale.
- The typo "to and cloud deployment" in `contact.intro` is fixed.
- The hardcoded `9+` in `AboutContent.tsx` is replaced with `4`.
- `vlm-code-context-mcp` benchmark framing is consistent across landing, about, and the MCP project page (same ~44% / 9-task phrasing).
- Visual layout is identical to before (stat cards same size, no text overflow, no component structure changes).
