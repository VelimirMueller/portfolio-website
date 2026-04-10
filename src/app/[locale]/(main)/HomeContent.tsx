'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, Database, Layout, Terminal, Box, Globe, Package } from 'lucide-react';
import { BentoCard } from '@/components/molecules/BentoCard';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { useTranslations } from 'next-intl';

const HighlightStatement = () => {
  const t = useTranslations();

  return (
    <BentoCard className="h-full bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden group min-h-[320px] border-none">
      <div className="relative w-full h-full min-h-[320px] flex flex-col justify-center items-center text-center px-6">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-500 text-[10px] font-mono uppercase tracking-wider">
            <Package size={10} />
            {t('home.highlightTag')}
          </div>
          <p className="font-mono text-lg md:text-xl font-bold text-black dark:text-white leading-tight max-w-xs">
            {t('home.highlightTitle')}
          </p>
          <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-mono text-xs w-full max-w-[280px] text-left">
            <span className="text-gray-400 dark:text-gray-600">$</span> npm install vlm-code-context-mcp
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[280px] leading-relaxed">
            {t('home.highlightDesc')}
          </p>
          <a
            href="https://github.com/VelimirMueller/vlm-code-context-mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-black dark:text-white border-b border-current pb-0.5 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors group/cta"
          >
            {t('home.highlightCta')} <ArrowRight size={10} className="group-hover/cta:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </BentoCard>
  );
};

const TechStackGrid = () => {
  const t = useTranslations();
  const stacks = [
    { label: "Next.js / Vue", icon: Globe, cat: "Framework" },
    { label: "Node.js / Quarkus", icon: Terminal, cat: "Backend" },
    { label: "Laravel", icon: Code2, cat: "Backend" },
    { label: "Supabase", icon: Database, cat: "Data" },
    { label: "Vercel", icon: Box, cat: "Platform" },
    { label: "TypeScript", icon: Code2, cat: "Language" },
    { label: "Claude AI", icon: Layout, cat: "AI" },
    { label: "CI/CD", icon: Terminal, cat: "Ops" },
  ];

  return (
    <BentoCard className="h-full bg-white dark:bg-[#121214]" title={t('home.techDna')}>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {stacks.map((item, i) => (
          <div key={i} className="flex flex-col p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border hover:border-brand-500/30 dark:hover:border-brand-500/30 transition-all duration-200 ease-out group">
            <div className="flex items-center justify-between mb-1.5">
              <item.icon size={14} className="text-light-sub dark:text-dark-sub group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors duration-200" aria-hidden="true"/>
              <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wide">{item.cat}</span>
            </div>
            <span className="text-[13px] font-bold text-light-text dark:text-dark-text group-hover:translate-x-0.5 transition-transform duration-200">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border">
         <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{t('home.systemStatus')}</span>
            <span className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-[10px] font-mono text-green-600 dark:text-green-500 uppercase">{t('home.operational')}</span>
            </span>
         </div>
      </div>
    </BentoCard>
  );
};

export default function HomeContent() {
  const t = useTranslations();

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto relative">
      {/* Animated Gradient Background - hidden on mobile for GPU performance */}
      <div className="fixed top-0 left-0 w-full h-[50vh] overflow-hidden pointer-events-none -z-10 hidden md:block">
        <div className="absolute top-[10%] right-[15%] w-[220px] h-[220px] rounded-full opacity-[0.25] dark:opacity-[0.35] blur-[80px] animate-stripe-1 bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[5%] left-[15%] w-[200px] h-[200px] rounded-full opacity-[0.25] dark:opacity-[0.35] blur-[80px] animate-stripe-2 bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-500 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[15%] left-[35%] w-[180px] h-[180px] rounded-full opacity-[0.2] dark:opacity-[0.3] blur-[70px] animate-stripe-3 bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[8%] right-[30%] w-[160px] h-[160px] rounded-full opacity-[0.2] dark:opacity-[0.3] blur-[60px] animate-stripe-4 bg-gradient-to-bl from-indigo-500 via-blue-500 to-sky-400 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[20%] left-[55%] w-[140px] h-[140px] rounded-full opacity-[0.18] dark:opacity-[0.25] blur-[60px] animate-stripe-5 bg-gradient-to-t from-amber-400 via-orange-400 to-yellow-300 mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-min">

        <AnimateIn from="left" className="md:col-span-6 lg:col-span-8">
        <BentoCard className="h-full min-h-[450px] bg-white dark:bg-[#121214] border-light-border dark:border-dark-border justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-noise pointer-events-none"></div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-500 text-[10px] font-mono uppercase tracking-wider backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-green-600 dark:bg-green-500 rounded-full animate-pulse"></span>
                  {t('home.badge')}
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-mono font-bold text-light-text dark:text-dark-text tracking-tighter leading-[0.9] mb-6">
                VELIMIR <br/>
                MÜLLER.
              </h1>

              <div className="flex items-center gap-4 mb-7">
                 <div className="h-0.5 w-12 bg-brand-600 dark:bg-brand-500" aria-hidden="true"></div>
                 <div>
                   <p className="font-mono text-sm md:text-lg text-light-sub dark:text-dark-sub uppercase tracking-widest font-medium">
                      {t('home.subtitle')}
                   </p>
                   <p className="font-mono text-[10px] md:text-xs text-light-sub/60 dark:text-dark-sub/60 uppercase tracking-widest mt-0.5">
                      {t('home.subtitleSecondary')}
                   </p>
                 </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 max-w-lg leading-[1.7] text-sm md:text-base border-l-2 border-light-border dark:border-dark-border pl-4">
                {t('home.description')}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-12">
               <Button to="/projects" className="bg-brand-600 hover:bg-brand-700 dark:bg-white dark:text-black dark:hover:bg-gray-200">{t('home.ctaProjects')}</Button>
               <Button to="/contact" variant="outline" className="border-light-border dark:border-dark-border text-light-text dark:text-dark-text">{t('home.ctaContact')}</Button>
            </div>
          </div>
        </BentoCard>
        </AnimateIn>

        <AnimateIn from="right" delay={100} className="md:col-span-3 lg:col-span-4">
          <HighlightStatement />
        </AnimateIn>

        <AnimateIn from="bottom-right" delay={200} className="md:col-span-3 lg:col-span-4">
          <TechStackGrid />
        </AnimateIn>

        <AnimateIn from="bottom-left" delay={100} className="md:col-span-6 lg:col-span-5">
        <BentoCard className="h-full bg-white dark:bg-[#121214]" subtitle={t('home.thePerson')}>
           <div className="h-full flex flex-col justify-center relative">
             <div className="absolute top-0 right-0 text-9xl font-serif italic text-black/5 dark:text-white/5 -z-10 translate-x-4 -translate-y-4 font-bold" aria-hidden="true">VM</div>
             <div className="font-mono text-sm text-gray-600 dark:text-gray-300 leading-relaxed z-10">
               <span className="text-4xl float-left mr-3 mt-[-15px] font-serif font-bold text-brand-600 dark:text-brand-500">&ldquo;</span>
               {t('home.personQuote')} <strong className="text-light-text dark:text-dark-text">{t('home.personQuoteHighlight')}</strong>
             </div>
             <div className="mt-8 flex items-center gap-4 border-t border-light-border dark:border-dark-border pt-4">
                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-gray-500 border-2 border-white dark:border-[#121214] shadow-sm">VM</div>
                <div>
                   <div className="text-sm font-bold text-light-text dark:text-dark-text">{t('home.personName')}</div>
                   <div className="text-[10px] text-brand-600 dark:text-brand-500 uppercase tracking-widest font-bold">{t('home.personRole')}</div>
                </div>
             </div>
           </div>
        </BentoCard>
        </AnimateIn>

        <AnimateIn from="bottom" delay={200} className="md:col-span-6 lg:col-span-3">
        <BentoCard className="h-full bg-zinc-100 dark:bg-zinc-900 border-none" subtitle={t('home.servicesLabel')}>
           <div className="flex flex-col h-full justify-between">
             <div>
               <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">{t('home.servicesTitle')}</h3>
               <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-4">
                  {t('home.servicesDesc')}
               </p>
             </div>
             <Link href="/services" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-light-text dark:text-dark-text border-b border-gray-300 dark:border-gray-700 pb-1 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-500 transition-all w-fit group">
                {t('home.allServices')} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
             </Link>
           </div>
        </BentoCard>
        </AnimateIn>

      </div>
    </div>
  );
}
