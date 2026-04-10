'use client';

import React from 'react';
import { ArrowUpRight, Cpu, Check, BrainCircuit } from 'lucide-react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { ExpandableProjectCard } from '@/components/molecules/ExpandableProjectCard';
import { useTranslations } from 'next-intl';

export default function ProjectsContent() {
  const t = useTranslations();
  const saasChecks = t.raw('projects.saas.checks') as string[];
  const mlChecks = t.raw('projects.ml.checks') as string[];

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <AnimateIn from="bottom">
        <SectionHeader title={t('projects.title')} subtitle={t('projects.subtitle')} />
      </AnimateIn>

      {/* --- FEATURED DEMOS --- */}
      <div className="mb-16 space-y-4">
        <AnimateIn from="left">
          <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-6">{t('projects.interactiveDemos')}</h3>
        </AnimateIn>

        <AnimateIn from="bottom" delay={100}>
          <ExpandableProjectCard
            title={t('projects.mcp.title')}
            category="Developer Tool"
            techStack={['Node.js', 'TypeScript', 'SQLite', 'MCP']}
            metricValue={t('projects.mcp.impact1Value')}
            metricLabel={t('projects.mcp.impact1Label')}
            challenge={t('projects.mcp.challenge')}
            solution={t('projects.mcp.solution')}
            impacts={[
              { value: t('projects.mcp.impact1Value'), label: t('projects.mcp.impact1Label') },
              { value: t('projects.mcp.impact2Value'), label: t('projects.mcp.impact2Label') },
              { value: t('projects.mcp.impact3Value'), label: t('projects.mcp.impact3Label') },
            ]}
            demoHref="/projects/mcp-demo"
            demoLabel={t('projects.mcp.viewDemo')}
            accentColor="emerald"
          />
        </AnimateIn>

        <AnimateIn from="bottom" delay={200}>
          <ExpandableProjectCard
            title={t('projects.dashboard.title')}
            category="UI Showcase"
            techStack={['React', 'TypeScript', 'CSS/SVG', 'Next.js']}
            metricValue={t('projects.dashboard.impact1Value')}
            metricLabel={t('projects.dashboard.impact1Label')}
            challenge={t('projects.dashboard.challenge')}
            solution={t('projects.dashboard.solution')}
            impacts={[
              { value: t('projects.dashboard.impact1Value'), label: t('projects.dashboard.impact1Label') },
              { value: t('projects.dashboard.impact2Value'), label: t('projects.dashboard.impact2Label') },
              { value: t('projects.dashboard.impact3Value'), label: t('projects.dashboard.impact3Label') },
            ]}
            demoHref="/projects/dashboard-demo"
            demoLabel={t('projects.dashboard.viewDemo')}
            accentColor="blue"
          />
        </AnimateIn>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-12">
        <AnimateIn from="left">
          <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-6">{t('projects.realWorldWork')}</h3>
        </AnimateIn>

        {/* Project 1: Enterprise Workflow */}
        <AnimateIn from="left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-[#111] rounded-3xl p-6 md:p-8 border border-black/5 dark:border-white/10 group hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 ease-out">
           <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                 <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono border border-purple-500/20 uppercase">End-to-End</span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono border border-blue-500/20 uppercase">Next.js / React</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">{t('projects.enterprise.title')}</h2>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {t('projects.enterprise.desc')}
                 </p>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {['Next.js', 'React', 'Supabase', 'Vercel', 'Figma'].map(tag => (
                      <span key={tag} className="text-[11px] font-mono text-gray-500 px-2.5 py-1 bg-gray-100 dark:bg-[#050505] rounded-md border border-black/5 dark:border-white/5">{tag}</span>
                    ))}
                 </div>
              </div>
              <Button to="/contact" variant="outline" className="w-fit">{t('projects.enterprise.cta')}</Button>
           </div>

           <div className="lg:col-span-7 bg-gray-50 dark:bg-[#050505] rounded-xl border border-black/5 dark:border-white/10 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                 <Cpu size={64} className="text-purple-900/20 dark:text-purple-900/40" />
              </div>

              <div className="grid grid-cols-2 gap-4 h-full content-center">
                 <div className="col-span-2 bg-white dark:bg-[#111] p-6 rounded border border-black/5 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-4xl md:text-5xl font-mono font-black text-black dark:text-white tracking-tight">500%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1.5">{t('projects.enterprise.metric')}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                       <ArrowUpRight size={24} className="text-green-600 dark:text-green-500"/>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-[#111] p-4 rounded border border-black/5 dark:border-white/5">
                    <div className="text-xs font-mono text-gray-500 uppercase mb-2">Role</div>
                    <div className="text-black dark:text-white font-mono text-sm">{t('projects.enterprise.role')}</div>
                 </div>
                 <div className="bg-white dark:bg-[#111] p-4 rounded border border-black/5 dark:border-white/5">
                    <div className="text-xs font-mono text-gray-500 uppercase mb-2">Focus</div>
                    <div className="text-black dark:text-white font-mono text-sm">{t('projects.enterprise.focus')}</div>
                 </div>
              </div>
           </div>
        </div>
        </AnimateIn>

        {/* Project 2: SaaS Platform */}
        <AnimateIn from="right">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-[#111] rounded-3xl p-6 md:p-8 border border-black/5 dark:border-white/10 group hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 ease-out">
           <div className="lg:col-span-5 flex flex-col justify-between order-2 lg:order-1">
              <div className="bg-gray-50 dark:bg-[#050505] rounded-xl border border-black/5 dark:border-white/10 p-6 h-full flex flex-col justify-center relative overflow-hidden">
                 <div className="space-y-4">
                    {saasChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <Check size={16} className="text-green-600 dark:text-green-500" />
                         <span className="text-sm text-gray-600 dark:text-gray-300">{check}</span>
                      </div>
                    ))}
                 </div>
                 <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="text-xs text-gray-500 mb-2">Key Tech</div>
                    <div className="flex gap-2">
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded border border-green-500/20 dark:border-green-900/30">Next.js</span>
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded border border-green-500/20 dark:border-green-900/30">Vue</span>
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded border border-green-500/20 dark:border-green-900/30">Node.js</span>
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded border border-green-500/20 dark:border-green-900/30">Laravel</span>
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
                 <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">{t('projects.saas.title')}</h2>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {t('projects.saas.desc')}
                 </p>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {['Next.js', 'Vue', 'Node.js', 'Laravel', 'Supabase', 'Tailwind', 'GitHub Actions', 'Vercel'].map(tag => (
                      <span key={tag} className="text-[11px] font-mono text-gray-500 px-2.5 py-1 bg-gray-100 dark:bg-[#050505] rounded-md border border-black/5 dark:border-white/5">{tag}</span>
                    ))}
                 </div>
              </div>
              <Button to="/contact" variant="outline" className="w-fit">{t('projects.saas.cta')}</Button>
           </div>
        </div>
        </AnimateIn>

        {/* Project 3: ML Lead Matching */}
        <AnimateIn from="left" delay={100}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-[#111] rounded-3xl p-6 md:p-8 border border-black/5 dark:border-white/10 group hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 ease-out">
           <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                 <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-mono border border-teal-500/20 uppercase">Machine Learning</span>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono border border-amber-500/20 uppercase">Data Science</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">{t('projects.ml.title')}</h2>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {t('projects.ml.desc')}
                 </p>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {['Python', 'scikit-learn', 'pandas', 'PostgreSQL', 'FastAPI'].map(tag => (
                      <span key={tag} className="text-[11px] font-mono text-gray-500 px-2.5 py-1 bg-gray-100 dark:bg-[#050505] rounded-md border border-black/5 dark:border-white/5">{tag}</span>
                    ))}
                 </div>
              </div>
              <Button to="/contact" variant="outline" className="w-fit">{t('projects.ml.cta')}</Button>
           </div>

           <div className="lg:col-span-7 bg-gray-50 dark:bg-[#050505] rounded-xl border border-black/5 dark:border-white/10 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                 <BrainCircuit size={64} className="text-teal-900/20 dark:text-teal-900/40" />
              </div>

              <div className="grid grid-cols-2 gap-4 h-full content-center">
                 <div className="col-span-2 bg-white dark:bg-[#111] p-6 rounded border border-black/5 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-4xl md:text-5xl font-mono font-black text-black dark:text-white tracking-tight">{t('projects.ml.metricValue')}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1.5">{t('projects.ml.metric')}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                       <ArrowUpRight size={24} className="text-teal-600 dark:text-teal-500"/>
                    </div>
                 </div>
                 <div className="col-span-2">
                    <div className="space-y-3">
                       {mlChecks.map((check, i) => (
                         <div key={i} className="flex items-center gap-3">
                            <Check size={16} className="text-teal-600 dark:text-teal-500 shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{check}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
        </AnimateIn>

      </div>
    </div>
  );
}
