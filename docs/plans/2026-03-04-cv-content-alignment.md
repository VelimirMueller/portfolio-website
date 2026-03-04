# CV Content Alignment & Video Replacement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align all website text with Velimir's CV/LinkedIn profile and replace the dashboard video with a highlight statement card.

**Architecture:** Text-only changes in EN/DE translation JSON files, plus replacing the DashboardPromoVideo component with a styled text card in page.tsx, and adding 2 new experience entries in about/page.tsx. No layout or style changes.

**Tech Stack:** Next.js, React, i18n JSON files, Tailwind CSS

---

### Task 1: Update English translations — positioning & homepage

**Files:**
- Modify: `src/locales/en.json`

**Step 1: Update homepage positioning keys**

In `en.json`, change these keys under `"home"`:

```json
"subtitle": "Senior Product Engineer",
"subtitleSecondary": "Full-Stack · ML · Infrastructure",
"description": "I ship products end-to-end. Over 9 years I've moved from frontend specialist to owning the full lifecycle — designing in Figma, building in React and different backend technologies, deploying on AWS and Azure, and writing the Terraform to hold it all together.",
"personQuote": "Good products don't start with code, but with understanding the business. I analyze requirements, translate them into UX/UI concepts, and own the technical execution from architecture to deployment. My goal:",
"personRole": "Product Engineer",
```

**Step 2: Update footer keys**

In `en.json`, change these keys under `"footer"`:

```json
"tagline": "Senior Product Engineer.",
"taglineSecondary": "Full-Stack · ML · Infrastructure.",
"taglineDesc": "From business needs to deployment — full lifecycle ownership.",
```

**Step 3: Update contact intro**

In `en.json`, change under `"contact"`:

```json
"intro": "Open for projects and roles where I own the full product lifecycle — from requirements analysis through UX/UI design to full-stack development and cloud deployment.",
```

**Step 4: Verify the app builds**

Run: `cd /home/velimir/Schreibtisch/dev/next-app && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/locales/en.json
git commit -m "content(en): update positioning to Senior Product Engineer"
```

---

### Task 2: Update English translations — about page bio & experience

**Files:**
- Modify: `src/locales/en.json`

**Step 1: Update about bio keys**

In `en.json`, change these keys under `"about"`:

```json
"bio1Bold": "Senior Product Engineer",
"bio1After": "who ships end-to-end. Over 9 years I've moved from frontend specialist to owning the full lifecycle — designing in Figma, building in React and various backend technologies, deploying on AWS and Azure, and writing the Terraform to hold it all together.",
"bio2": "Recently, I built a lead management platform that cut seller assignment time by 3-4x and developed an ML model projecting 100% conversion lift for a sales pipeline — from data analysis through model development to integration planning.",
"bio3": "My stack spans the full picture: React, Vue, TypeScript, Laravel, Supabase, Vercel, Terraform, Docker, AWS, Azure. I write tests (unit, E2E, visual regression), design component systems, and care about the details that separate \"works\" from \"works well.\"",
```

**Step 2: Update GALVANY experience**

In `en.json`, change under `"about"."exp1"`:

```json
"title": "Senior Software Engineer - Frontend / Product",
"desc": "Owned product engineering end-to-end — from requirements and Figma designs through full-stack implementation to cloud deployment. Built a lead management platform (Laravel, React, TypeScript, Inertia, Terraform) that reduced assignment time by 3-4x. Independently developed an ML model projecting 100% conversion lift. Configured AWS and Azure environments with Terraform. Full testing pyramid: unit, E2E with Playwright, visual regression."
```

**Step 3: Update DEMOS experience**

In `en.json`, change under `"about"."exp2"`:

```json
"desc": "Built and maintained Vue.js applications for a civic-tech platform. Designed architecture patterns for Vue 2/3 (Vuex, Pinia), developed interactive maps with OpenLayers, established testing practices (Jest, Vitest), and mentored junior developers with sessions on TDD and refactoring patterns."
```

**Step 4: Add cimdata and Servicezentrum experience entries**

In `en.json`, add under `"about"` (after `"exp4"`):

```json
"exp5": {
  "title": "IT-Trainee - Application Development",
  "tag": "IT Training (IHK)",
  "company": "cimdata Bildungsakademie GmbH",
  "date": "Apr 2019 - Jun 2021",
  "desc": "Formal training as IT Specialist for Application Development (IHK certified). Included a 10-month internship at Servicezentrum der Berliner Volkshochschulen with Linux infrastructure, IT security, and development work."
},
"exp6": {
  "title": "Internship Program",
  "tag": "Public Sector IT",
  "company": "Servicezentrum der Berliner Volkshochschulen",
  "date": "Aug 2020 - May 2021",
  "desc": "Administered Linux systems with BigBlueButton, applied IT security concepts for self-hosted servers, developed features with Ruby on Rails and React, and managed internal IT infrastructure."
}
```

**Step 5: Commit**

```bash
git add src/locales/en.json
git commit -m "content(en): update about bio, experience entries, add cimdata & Servicezentrum"
```

---

### Task 3: Update German translations — positioning & homepage

**Files:**
- Modify: `src/locales/de.json`

**Step 1: Update homepage positioning keys**

In `de.json`, change these keys under `"home"`:

```json
"subtitle": "Senior Product Engineer",
"subtitleSecondary": "Full-Stack · ML · Infrastructure",
"description": "Ich liefere Produkte end-to-end. In über 9 Jahren bin ich vom Frontend-Spezialisten zum Verantwortlichen für den gesamten Lifecycle geworden — von Figma-Design über React und verschiedene Backend-Technologien bis zu AWS/Azure-Deployment und Terraform.",
"personQuote": "Gute Produkte beginnen nicht beim Code, sondern beim Verstehen des Business. Ich analysiere Anforderungen, übersetze sie in UX/UI-Konzepte und verantworte die technische Umsetzung von der Architektur bis zum Deployment. Mein Ziel:",
"personRole": "Product Engineer",
```

**Step 2: Update footer keys**

In `de.json`, change these keys under `"footer"`:

```json
"tagline": "Senior Product Engineer.",
"taglineSecondary": "Full-Stack · ML · Infrastructure.",
"taglineDesc": "Von Business-Anforderungen bis zum Deployment — Full Lifecycle Ownership.",
```

**Step 3: Update contact intro**

In `de.json`, change under `"contact"`:

```json
"intro": "Offen für Projekte und Rollen, in denen ich den gesamten Produktlebenszyklus verantworte — von der Anforderungsanalyse über UX/UI-Design bis zur Full-Stack-Entwicklung und Cloud-Deployment.",
```

**Step 4: Commit**

```bash
git add src/locales/de.json
git commit -m "content(de): update positioning to Senior Product Engineer"
```

---

### Task 4: Update German translations — about page bio & experience

**Files:**
- Modify: `src/locales/de.json`

**Step 1: Update about bio keys**

In `de.json`, change these keys under `"about"`:

```json
"bio1Bold": "Senior Product Engineer",
"bio1After": "der Produkte end-to-end liefert. In über 9 Jahren bin ich vom Frontend-Spezialisten zum Verantwortlichen für den gesamten Lifecycle geworden — von Figma-Design über React und verschiedene Backend-Technologien bis zu AWS/Azure-Deployment und Terraform.",
"bio2": "Zuletzt habe ich eine Lead-Management-Plattform gebaut, die die Zuweisungszeit um das 3-4-fache reduziert hat, und ein ML-Modell entwickelt, das eine 100%ige Conversion-Steigerung für die Sales-Pipeline projiziert — von der Datenanalyse über die Modellentwicklung bis zur Integrationsplanung.",
"bio3": "Mein Stack umfasst das gesamte Bild: React, Vue, TypeScript, Laravel, Supabase, Vercel, Terraform, Docker, AWS, Azure. Ich schreibe Tests (Unit, E2E, visuelle Regression), gestalte Komponentensysteme und achte auf die Details, die \"funktioniert\" von \"funktioniert gut\" unterscheiden.",
```

**Step 2: Update GALVANY experience**

In `de.json`, change under `"about"."exp1"`:

```json
"title": "Senior Software Engineer - Frontend / Product",
"desc": "End-to-End Product Engineering verantwortet — von Requirements und Figma-Designs über Full-Stack-Implementierung bis zum Cloud-Deployment. Lead-Management-Plattform gebaut (Laravel, React, TypeScript, Inertia, Terraform), die die Zuweisungszeit um das 3-4-fache reduzierte. Eigenständig ML-Modell entwickelt mit projizierter 100% Conversion-Steigerung. AWS- und Azure-Umgebungen mit Terraform konfiguriert. Vollständige Test-Pyramide: Unit, E2E mit Playwright, visuelle Regression."
```

**Step 3: Update DEMOS experience**

In `de.json`, change under `"about"."exp2"`:

```json
"desc": "Vue.js-Applikationen für eine Civic-Tech-Plattform gebaut und gewartet. Architekturmuster für Vue 2/3 entworfen (Vuex, Pinia), interaktive Karten mit OpenLayers entwickelt, Testing-Praktiken etabliert (Jest, Vitest) und Junior-Entwickler mit Sessions zu TDD und Refactoring-Patterns mentored."
```

**Step 4: Add cimdata and Servicezentrum experience entries**

In `de.json`, add under `"about"` (after `"exp4"`):

```json
"exp5": {
  "title": "IT-Trainee - Anwendungsentwicklung",
  "tag": "IT-Ausbildung (IHK)",
  "company": "cimdata Bildungsakademie GmbH",
  "date": "Apr 2019 - Jun 2021",
  "desc": "Ausbildung zum Fachinformatiker für Anwendungsentwicklung (IHK-zertifiziert). Inklusive 10-monatigem Praktikum beim Servicezentrum der Berliner Volkshochschulen mit Linux-Infrastruktur, IT-Sicherheit und Entwicklungsarbeit."
},
"exp6": {
  "title": "Praktikum",
  "tag": "Öffentlicher Sektor IT",
  "company": "Servicezentrum der Berliner Volkshochschulen",
  "date": "Aug 2020 - Mai 2021",
  "desc": "Linux-Systeme mit BigBlueButton administriert, IT-Sicherheitskonzepte für selbst gehostete Server umgesetzt, Features mit Ruby on Rails und React entwickelt und interne IT-Infrastruktur verwaltet."
}
```

**Step 5: Verify build**

Run: `cd /home/velimir/Schreibtisch/dev/next-app && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/locales/de.json
git commit -m "content(de): update about bio, experience entries, add cimdata & Servicezentrum"
```

---

### Task 5: Replace video component with highlight statement card

**Files:**
- Modify: `src/app/(main)/page.tsx`

**Step 1: Replace the DashboardPromoVideo component**

In `src/app/(main)/page.tsx`, replace the entire `DashboardPromoVideo` component (lines 11-110) with a `HighlightStatement` component:

```tsx
const HighlightStatement = () => {
  const { t } = useLanguage();

  return (
    <BentoCard className="h-full bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden group min-h-[320px] border-none">
      <div className="relative w-full h-full min-h-[320px] flex flex-col justify-center items-center text-center px-6">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/20 bg-brand-500/5 text-brand-600 dark:text-brand-500 text-[10px] font-mono uppercase tracking-wider">
            {t('home.highlightTag')}
          </div>
          <p className="font-mono text-2xl md:text-3xl font-bold text-black dark:text-white leading-tight max-w-sm">
            {t('home.highlightTitle')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            {t('home.highlightDesc')}
          </p>
        </div>
      </div>
    </BentoCard>
  );
};
```

**Step 2: Update the JSX to use the new component**

In `src/app/(main)/page.tsx`, change line 209 from:

```tsx
<DashboardPromoVideo />
```

to:

```tsx
<HighlightStatement />
```

**Step 3: Remove unused imports**

Remove `Play` from the lucide-react import (line 5) since the video play button is gone. Also remove `useState, useEffect, useRef` from React import if no longer used by any remaining component. Keep `useRef` only if still used.

Check: `useState` is not used elsewhere in the file. `useEffect` is not used elsewhere. `useRef` is not used elsewhere. So the React import becomes:

```tsx
import React from 'react';
```

**Step 4: Add translation keys for the highlight card**

In `en.json`, add under `"home"`:

```json
"highlightTag": "ML Achievement",
"highlightTitle": "100% Conversion Lift",
"highlightDesc": "Built an ML model projecting 100% conversion lift for a sales pipeline. From data analysis through model development to integration planning."
```

In `de.json`, add under `"home"`:

```json
"highlightTag": "ML Achievement",
"highlightTitle": "100% Conversion-Steigerung",
"highlightDesc": "ML-Modell entwickelt mit projizierter 100% Conversion-Steigerung für die Sales-Pipeline. Von der Datenanalyse über die Modellentwicklung bis zur Integrationsplanung."
```

**Step 5: Remove unused translation keys**

In both `en.json` and `de.json`, remove:

```json
"dashboardDemo": "...",
"clickToPlay": "...",
```

**Step 6: Verify build**

Run: `cd /home/velimir/Schreibtisch/dev/next-app && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add src/app/\(main\)/page.tsx src/locales/en.json src/locales/de.json
git commit -m "feat: replace dashboard video with ML highlight statement card"
```

---

### Task 6: Add new experience entries to about page template

**Files:**
- Modify: `src/app/(main)/about/page.tsx`

**Step 1: Add exp5 entry after exp4 block**

In `src/app/(main)/about/page.tsx`, after the exp4 `</div>` block (after line 155), add a new timeline entry for cimdata (exp5). Copy the exact same structure as exp4 (lines 140-155) but reference `exp5` keys:

```tsx
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_8px_white] dark:shadow-[0_0_0_8px_#111]">
                      <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 dark:bg-[#050505] p-6 rounded-xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-colors">
                      <div className="flex flex-wrap justify-between items-center mb-1 gap-y-1 gap-x-3">
                        <h3 className="font-bold text-black dark:text-white text-lg min-w-0">{t('about.exp5.title')}</h3>
                        <span className="text-xs font-mono text-gray-500 shrink-0">{t('about.exp5.tag')}</span>
                      </div>
                      <div className="text-xs font-mono text-brand-600 dark:text-brand-500 mb-1">{t('about.exp5.company')}</div>
                      <time className="block mb-2 text-xs font-mono text-gray-500 uppercase">{t('about.exp5.date')}</time>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {t('about.exp5.desc')}
                      </p>
                  </div>
              </div>
```

**Step 2: Add exp6 entry after exp5**

Add another identical block for exp6 (Servicezentrum) after exp5, referencing `exp6` keys.

```tsx
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_8px_white] dark:shadow-[0_0_0_8px_#111]">
                      <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 dark:bg-[#050505] p-6 rounded-xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-colors">
                      <div className="flex flex-wrap justify-between items-center mb-1 gap-y-1 gap-x-3">
                        <h3 className="font-bold text-black dark:text-white text-lg min-w-0">{t('about.exp6.title')}</h3>
                        <span className="text-xs font-mono text-gray-500 shrink-0">{t('about.exp6.tag')}</span>
                      </div>
                      <div className="text-xs font-mono text-brand-600 dark:text-brand-500 mb-1">{t('about.exp6.company')}</div>
                      <time className="block mb-2 text-xs font-mono text-gray-500 uppercase">{t('about.exp6.date')}</time>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {t('about.exp6.desc')}
                      </p>
                  </div>
              </div>
```

**Step 3: Verify build**

Run: `cd /home/velimir/Schreibtisch/dev/next-app && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/\(main\)/about/page.tsx
git commit -m "feat: add cimdata and Servicezentrum experience entries to about page"
```

---

### Task 7: Update skills terminal on about page

**Files:**
- Modify: `src/app/(main)/about/page.tsx`

**Step 1: Update the hardcoded skills JSON in the terminal component**

In `src/app/(main)/about/page.tsx`, replace the skills terminal content (lines 61-76) with:

```tsx
               <div>
                  <div className="text-purple-600 dark:text-purple-400 mb-1">&quot;frontend&quot;:</div>
                  <div className="pl-4 text-green-600 dark:text-green-400">[&quot;Next.js&quot;, &quot;React&quot;, &quot;Vue&quot;, &quot;TypeScript&quot;, &quot;Tailwind&quot;]</div>
               </div>
               <div>
                  <div className="text-purple-600 dark:text-purple-400 mb-1">&quot;backend&quot;:</div>
                  <div className="pl-4 text-green-600 dark:text-green-400">[&quot;Laravel&quot;, &quot;Supabase&quot;, &quot;Ruby on Rails&quot;]</div>
               </div>
               <div>
                  <div className="text-purple-600 dark:text-purple-400 mb-1">&quot;infrastructure&quot;:</div>
                  <div className="pl-4 text-green-600 dark:text-green-400">[&quot;AWS&quot;, &quot;Azure&quot;, &quot;Terraform&quot;, &quot;Docker&quot;, &quot;Vercel&quot;]</div>
               </div>
               <div>
                  <div className="text-purple-600 dark:text-purple-400 mb-1">&quot;process&quot;:</div>
                  <div className="pl-4 text-green-600 dark:text-green-400">[&quot;Requirements Engineering&quot;, &quot;UX/UI&quot;, &quot;Figma&quot;]</div>
               </div>
               <div>
                  <div className="text-purple-600 dark:text-purple-400 mb-1">&quot;ml&quot;:</div>
                  <div className="pl-4 text-green-600 dark:text-green-400">[&quot;Data Analysis&quot;, &quot;Model Dev&quot;, &quot;Python&quot;]</div>
               </div>
```

**Step 2: Verify build**

Run: `cd /home/velimir/Schreibtisch/dev/next-app && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/\(main\)/about/page.tsx
git commit -m "content: update skills terminal with full-stack and ML skills"
```

---

### Task 8: Update services page text to reflect full-stack positioning

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/de.json`

**Step 1: Update English services text**

In `en.json`, change under `"services"`:

```json
"valueItems": [
  "Requirements Engineering & Stakeholder Communication",
  "UX/UI Design as Part of Brand Identity",
  "Full-Stack Development with React, Laravel & Supabase",
  "CI/CD, Cloud Deployment (AWS, Azure, Vercel) & Monitoring"
],
```

And change `"serviceNames"."frontendDevelopment"`:

```json
"frontendDevelopment": "Full-Stack Development"
```

**Step 2: Update German services text**

In `de.json`, change under `"services"`:

```json
"valueItems": [
  "Requirements Engineering & Stakeholder-Kommunikation",
  "UX/UI-Design als Teil der Brand Identity",
  "Full-Stack-Entwicklung mit React, Laravel & Supabase",
  "CI/CD, Cloud Deployment (AWS, Azure, Vercel) & Monitoring"
],
```

And change `"serviceNames"."frontendDevelopment"`:

```json
"frontendDevelopment": "Full-Stack Development"
```

**Step 3: Verify build**

Run: `cd /home/velimir/Schreibtisch/dev/next-app && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/locales/en.json src/locales/de.json
git commit -m "content: update services page to reflect full-stack positioning"
```

---

### Task 9: Final verification

**Step 1: Full build check**

Run: `cd /home/velimir/Schreibtisch/dev/next-app && npm run build`
Expected: Build succeeds with no errors

**Step 2: Run existing tests**

Run: `cd /home/velimir/Schreibtisch/dev/next-app && npm test 2>&1 | tail -20`
Expected: All existing tests pass

**Step 3: Visual spot-check**

Run: `cd /home/velimir/Schreibtisch/dev/next-app && npm run dev`

Verify in browser:
- Homepage: "Senior Product Engineer" title, highlight card instead of video
- About page: Updated bio, 6 experience entries, updated skills terminal
- Footer: "Senior Product Engineer" tagline
- Services: "Full-Stack Development" in service names
- Contact: Updated intro text
- Switch to German and verify all DE translations

**Step 4: Commit any fixes if needed**
