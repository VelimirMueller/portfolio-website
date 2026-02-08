import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Cpu, Check, LayoutDashboard, ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import { BentoCard } from '@/components/molecules/BentoCard';

export default function ProjectsPage() {
  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <SectionHeader title="WORK." subtitle="Real Impact" />

      {/* --- FEATURED DEMO --- */}
      <div className="mb-16">
         <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-6">Interactive Demo</h3>
         <Link href="/projects/dashboard-demo" className="block group">
           <BentoCard className="bg-gradient-to-r from-gray-50 to-white dark:from-[#111] dark:to-[#0A0A0A] border-blue-500/20 hover:border-blue-500/50 transition-all">
              <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono mb-4 border border-blue-500/20">
                       <LayoutDashboard size={12} />
                       <span>Live UI Demo</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-4">CRM Dashboard Interface</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-xl">
                       Eine interaktive Demonstration meiner UI/UX Skills. Modernes Dashboard-Design mit Custom Charts (CSS/SVG only), Responsive Sidebar Layout und Micro-Interactions. Simuliert ein Content-Marketing CRM.
                    </p>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-mono text-xs font-bold group-hover:translate-x-2 transition-transform">
                       Launch Demo <ArrowRight size={14} className="ml-2" />
                    </div>
                 </div>

                 <div className="w-full md:w-1/3 aspect-video bg-gray-100 dark:bg-[#050505] rounded-xl border border-gray-200 dark:border-[#222] p-4 relative overflow-hidden shadow-2xl group-hover:shadow-blue-900/10 transition-shadow">
                    <div className="absolute top-4 left-4 w-12 h-full bg-white dark:bg-[#111] rounded-l-lg border-r border-gray-200 dark:border-[#222]"></div>
                    <div className="absolute top-4 left-20 right-4 h-8 bg-white dark:bg-[#111] rounded-lg border border-gray-200 dark:border-transparent"></div>
                    <div className="absolute top-16 left-20 w-1/3 h-24 bg-white dark:bg-[#111] rounded-lg border border-gray-200 dark:border-[#222]"></div>
                    <div className="absolute top-16 left-[45%] w-1/3 h-24 bg-white dark:bg-[#111] rounded-lg border border-gray-200 dark:border-[#222]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-100 dark:from-[#050505] to-transparent pointer-events-none"></div>
                 </div>
              </div>
           </BentoCard>
         </Link>
      </div>

      <div className="flex flex-col gap-8 md:gap-12">

        {/* Project 1: Enterprise Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-[#111] rounded-3xl p-6 md:p-8 border border-black/5 dark:border-white/10 group hover:border-black/20 dark:hover:border-white/20 transition-all">
           <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                 <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono border border-purple-500/20 uppercase">End-to-End</span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono border border-blue-500/20 uppercase">Next.js / React</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">Enterprise Workflow Automation</h2>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    Vollständige Projektverantwortung: Anforderungsanalyse mit Stakeholdern, UX/UI-Konzeption in Figma, Frontend-Entwicklung und Deployment. Business-Anforderungen direkt in skalierbare Lösungen übersetzt.
                 </p>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {['Next.js', 'React', 'Supabase', 'Vercel', 'Figma'].map(t => (
                      <span key={t} className="text-xs font-mono text-gray-500 px-2 py-1 bg-gray-100 dark:bg-[#050505] rounded border border-black/5 dark:border-white/5">{t}</span>
                    ))}
                 </div>
              </div>
              <Button to="/contact" variant="outline" className="w-fit">Details anfragen</Button>
           </div>

           <div className="lg:col-span-7 bg-gray-50 dark:bg-[#050505] rounded-xl border border-black/5 dark:border-white/10 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                 <Cpu size={64} className="text-purple-900/20 dark:text-purple-900/40" />
              </div>

              <div className="grid grid-cols-2 gap-4 h-full content-center">
                 <div className="col-span-2 bg-white dark:bg-[#111] p-6 rounded border border-black/5 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-mono font-bold text-black dark:text-white">500%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Produktivitätssteigerung</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                       <ArrowUpRight size={24} className="text-green-600 dark:text-green-500"/>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-[#111] p-4 rounded border border-black/5 dark:border-white/5">
                    <div className="text-xs font-mono text-gray-500 uppercase mb-2">Role</div>
                    <div className="text-black dark:text-white font-mono text-sm">Lead / Owner</div>
                 </div>
                 <div className="bg-white dark:bg-[#111] p-4 rounded border border-black/5 dark:border-white/5">
                    <div className="text-xs font-mono text-gray-500 uppercase mb-2">Focus</div>
                    <div className="text-black dark:text-white font-mono text-sm">Architektur</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Project 2: SaaS Platform */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-[#111] rounded-3xl p-6 md:p-8 border border-black/5 dark:border-white/10 group hover:border-black/20 dark:hover:border-white/20 transition-all">
           <div className="lg:col-span-5 flex flex-col justify-between order-2 lg:order-1">
              <div className="bg-gray-50 dark:bg-[#050505] rounded-xl border border-black/5 dark:border-white/10 p-6 h-full flex flex-col justify-center relative overflow-hidden">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Check size={16} className="text-green-600 dark:text-green-500" />
                       <span className="text-sm text-gray-600 dark:text-gray-300">Requirements Engineering mit Stakeholdern</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Check size={16} className="text-green-600 dark:text-green-500" />
                       <span className="text-sm text-gray-600 dark:text-gray-300">UX/UI-Konzeption & Branding</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Check size={16} className="text-green-600 dark:text-green-500" />
                       <span className="text-sm text-gray-600 dark:text-gray-300">CI/CD Pipeline & Automated Testing</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Check size={16} className="text-green-600 dark:text-green-500" />
                       <span className="text-sm text-gray-600 dark:text-gray-300">Deployment via Vercel</span>
                    </div>
                 </div>
                 <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="text-xs text-gray-500 mb-2">Key Tech</div>
                    <div className="flex gap-2">
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded border border-green-500/20 dark:border-green-900/30">Next.js</span>
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded border border-green-500/20 dark:border-green-900/30">Supabase</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-7 flex flex-col justify-between order-1 lg:order-2">
              <div>
                 <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-mono border border-orange-500/20 uppercase">Branding</span>
                    <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white text-[10px] font-mono border border-black/10 dark:border-white/20 uppercase">Full Process</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">SaaS Platform & Brand Identity</h2>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    Ganzheitliche Projektplanung: Business-Anforderungen erfasst, UX/UI-Design als Teil der Brand Identity entwickelt, Frontend mit Next.js umgesetzt und über CI/CD-Pipelines deployed.
                 </p>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {['Next.js', 'Supabase', 'Tailwind', 'GitHub Actions', 'Vercel'].map(t => (
                      <span key={t} className="text-xs font-mono text-gray-500 px-2 py-1 bg-gray-100 dark:bg-[#050505] rounded border border-black/5 dark:border-white/5">{t}</span>
                    ))}
                 </div>
              </div>
              <Button to="/contact" variant="outline" className="w-fit">Details anfragen</Button>
           </div>
        </div>

      </div>
    </div>
  );
}
