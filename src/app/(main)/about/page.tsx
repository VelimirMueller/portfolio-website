import React from 'react';
import { Terminal } from 'lucide-react';
import { BentoCard } from '@/components/molecules/BentoCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';

export default function AboutPage() {
  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <SectionHeader title="PROFILE." subtitle="Velimir Müller" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Bio Text */}
        <BentoCard className="lg:col-span-8 bg-white dark:bg-[#111] min-h-[400px]" title="Summary">
           <div className="prose dark:prose-invert prose-lg max-w-none mt-4">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                 Ich bin <span className="text-black dark:text-white font-bold">Senior Frontend Engineer</span> mit langjähriger Erfahrung im Product Engineering. Mein Fokus liegt auf dem gesamten Produktprozess – von der Anforderungsanalyse bis zum Deployment.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                 Ich verstehe Requirements Engineering als Grundlage jedes erfolgreichen Projekts: Business-Anforderungen erfassen, in UX/UI-Konzepte übersetzen und dabei das Branding als integralen Bestandteil des Prozesses behandeln.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                 Ich plane und begleite Projekte ganzheitlich – von der Idee bis zum Go-Live – mit modernem Stack wie Next.js, Supabase, Vercel und CI/CD-Pipelines. Claude AI nutze ich als Produktivitätswerkzeug im Entwicklungsalltag.
              </p>
           </div>

           <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 grid grid-cols-3 gap-4">
              <div>
                 <div className="text-2xl font-mono font-bold text-black dark:text-white">9+</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest">Jahre Erfahrung</div>
              </div>
              <div>
                 <div className="text-2xl font-mono font-bold text-black dark:text-white">E2E</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest">Req → Deployment</div>
              </div>
              <div>
                 <div className="text-2xl font-mono font-bold text-black dark:text-white">UX</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest">UI & Branding</div>
              </div>
           </div>
        </BentoCard>

        {/* Tech Stack Terminal */}
        <BentoCard className="lg:col-span-4 bg-gray-50 dark:bg-[#0A0A0A] border-black/5 dark:border-white/10 p-0">
           <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#111] border-b border-black/5 dark:border-white/5">
              <Terminal size={14} className="text-gray-500"/>
              <span className="text-xs font-mono text-gray-500">skills.json</span>
           </div>
           <div className="p-4 font-mono text-sm space-y-4">
               <div>
                  <div className="text-purple-600 dark:text-purple-400 mb-1">&quot;frontend&quot;:</div>
                  <div className="pl-4 text-green-600 dark:text-green-400">[&quot;Next.js&quot;, &quot;React&quot;, &quot;TypeScript&quot;, &quot;Tailwind&quot;]</div>
               </div>
               <div>
                  <div className="text-purple-600 dark:text-purple-400 mb-1">&quot;platform&quot;:</div>
                  <div className="pl-4 text-green-600 dark:text-green-400">[&quot;Supabase&quot;, &quot;Vercel&quot;, &quot;CI/CD&quot;, &quot;GitHub Actions&quot;]</div>
               </div>
               <div>
                  <div className="text-purple-600 dark:text-purple-400 mb-1">&quot;process&quot;:</div>
                  <div className="pl-4 text-green-600 dark:text-green-400">[&quot;Requirements Engineering&quot;, &quot;UX/UI&quot;, &quot;Branding&quot;]</div>
               </div>
               <div>
                  <div className="text-purple-600 dark:text-purple-400 mb-1">&quot;tools&quot;:</div>
                  <div className="pl-4 text-green-600 dark:text-green-400">[&quot;Figma&quot;, &quot;Claude AI&quot;, &quot;Playwright&quot;]</div>
               </div>
           </div>
        </BentoCard>

        {/* Timeline */}
        <BentoCard className="lg:col-span-12 bg-white dark:bg-[#111]" title="Experience Log">
           <div className="mt-8 space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-black/10 dark:before:via-white/10 before:to-transparent">

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_8px_white] dark:shadow-[0_0_0_8px_#111]">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 dark:bg-[#050505] p-6 rounded-xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-black dark:text-white text-lg">Senior Software Engineer - Frontend</h3>
                        <span className="text-xs font-mono text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-900/20 px-2 py-0.5 rounded">Current</span>
                      </div>
                      <div className="text-xs font-mono text-brand-600 dark:text-brand-500 mb-1">GALVANY</div>
                      <time className="block mb-2 text-xs font-mono text-gray-500 uppercase">Feb 2025 - Present</time>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        End-to-End Produktentwicklung mit React und Vue.js. UX-Design in Figma, AWS-Infrastruktur (S3, CloudFront), Testing mit Vitest und Playwright.
                      </p>
                  </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_8px_white] dark:shadow-[0_0_0_8px_#111]">
                      <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 dark:bg-[#050505] p-6 rounded-xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-black dark:text-white text-lg">Software Engineer - Frontend</h3>
                        <span className="text-xs font-mono text-gray-500">Enterprise SaaS</span>
                      </div>
                      <div className="text-xs font-mono text-brand-600 dark:text-brand-500 mb-1">DEMOS plan GmbH</div>
                      <time className="block mb-2 text-xs font-mono text-gray-500 uppercase">Oct 2021 - Jan 2025</time>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Vue 2/3 Architektur, interaktive Maps mit OpenLayers, State Management mit VueX/Pinia, Unit- und Komponententests mit Jest/Vitest, Mentoring.
                      </p>
                  </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_8px_white] dark:shadow-[0_0_0_8px_#111]">
                      <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 dark:bg-[#050505] p-6 rounded-xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-black dark:text-white text-lg">Web Developer</h3>
                        <span className="text-xs font-mono text-gray-500">Freelance</span>
                      </div>
                      <time className="block mb-2 text-xs font-mono text-gray-500 uppercase">Feb 2019 - Jun 2020</time>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Erstellung und Wartung von WordPress-Instanzen mit WooCommerce-Webshops – von der Planung bis zum Deployment.
                      </p>
                  </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_8px_white] dark:shadow-[0_0_0_8px_#111]">
                      <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 dark:bg-[#050505] p-6 rounded-xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-black dark:text-white text-lg">Specialist</h3>
                        <span className="text-xs font-mono text-gray-500">E-Commerce</span>
                      </div>
                      <div className="text-xs font-mono text-brand-600 dark:text-brand-500 mb-1">Zalando SE</div>
                      <time className="block mb-2 text-xs font-mono text-gray-500 uppercase">Apr 2017 - Mar 2019</time>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Specialist bei Zalando SE im Bereich E-Commerce.
                      </p>
                  </div>
              </div>

           </div>
        </BentoCard>

      </div>
    </div>
  );
}
