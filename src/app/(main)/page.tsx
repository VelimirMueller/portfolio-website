'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, ShieldCheck, Activity, Layers, Code2, Database, Layout, Terminal, Box, Globe } from 'lucide-react';
import { BentoCard } from '@/components/molecules/BentoCard';
import { Button } from '@/components/atoms/Button';

const ImpactMetrics = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const metrics = [
    {
      value: "500%",
      label: "Produktivität",
      sub: "durch Microservices",
      icon: TrendingUp,
      tag: "Architecture"
    },
    {
      value: "100",
      label: "Lighthouse",
      sub: "Performance Score",
      icon: Zap,
      tag: "Web Vitals"
    },
    {
      value: "100%",
      label: "Type Safety",
      sub: "Strict Coverage",
      icon: ShieldCheck,
      tag: "Quality"
    },
    {
      value: "<100ms",
      label: "Interaction",
      sub: "INP Metric",
      icon: Activity,
      tag: "UX"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % metrics.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [metrics.length]);

  const current = metrics[activeIndex];
  const Icon = current.icon;

  return (
    <BentoCard className="md:col-span-3 lg:col-span-4 bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden group min-h-[320px] border-none">
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative z-10 flex flex-col h-full justify-between p-2">
        <div className="flex justify-between items-start">
           <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-black border border-black/5 dark:border-white/10 backdrop-blur-sm">
             <Layers size={10} className="text-brand-600 dark:text-brand-500"/>
             <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">{current.tag}</span>
           </div>
           <div className="w-10 h-10 rounded-lg bg-white dark:bg-black border border-black/5 dark:border-white/10 flex items-center justify-center shadow-sm">
              <Icon size={20} className="text-black dark:text-white transition-all duration-300 transform group-hover:scale-110" />
           </div>
        </div>

        <div className="text-center py-4">
           <div key={activeIndex} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="text-5xl md:text-6xl lg:text-7xl font-mono font-bold tracking-tighter leading-none text-black dark:text-white">
                {current.value}
             </div>
             <p className="font-mono text-sm uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mt-4">{current.label}</p>
             <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">{current.sub}</p>
           </div>
        </div>

        <div className="flex justify-center gap-1.5 pb-2">
           {metrics.map((_, i) => (
             <div key={i} className="h-1 rounded-full bg-black/5 dark:bg-white/10 w-8 overflow-hidden">
                <div
                  className={`h-full bg-brand-600 dark:bg-brand-500 transition-all duration-[4000ms] ease-linear ${i === activeIndex ? 'w-full' : 'w-0'}`}
                  style={{ transitionProperty: 'width' }}
                ></div>
             </div>
           ))}
        </div>
      </div>
    </BentoCard>
  );
};

const TechStackGrid = () => {
  const stacks = [
    { label: "Next.js", icon: Globe, cat: "Framework" },
    { label: "Supabase", icon: Database, cat: "Backend" },
    { label: "Vercel", icon: Box, cat: "Platform" },
    { label: "TypeScript", icon: Code2, cat: "Language" },
    { label: "Claude AI", icon: Layout, cat: "AI" },
    { label: "CI/CD", icon: Terminal, cat: "Ops" },
  ];

  return (
    <BentoCard className="md:col-span-3 lg:col-span-4 bg-white dark:bg-[#121214]" title="Engineering DNA">
      <div className="grid grid-cols-2 gap-2 mt-4">
        {stacks.map((item, i) => (
          <div key={i} className="flex flex-col p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border hover:border-brand-500/30 dark:hover:border-brand-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <item.icon size={16} className="text-light-sub dark:text-dark-sub group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors"/>
              <span className="text-[9px] font-mono text-gray-400 uppercase">{item.cat}</span>
            </div>
            <span className="text-sm font-bold text-light-text dark:text-dark-text group-hover:translate-x-1 transition-transform">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border">
         <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">System Status</span>
            <span className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-[10px] font-mono text-green-600 dark:text-green-500 uppercase">Operational</span>
            </span>
         </div>
      </div>
    </BentoCard>
  );
};

export default function HomePage() {
  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-min">

        <BentoCard className="md:col-span-6 lg:col-span-8 min-h-[450px] bg-white dark:bg-[#121214] border-light-border dark:border-dark-border justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-noise pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-500 text-[10px] font-mono uppercase tracking-wider backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-green-600 dark:bg-green-500 rounded-full animate-pulse"></span>
                  Available for Projects
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-mono font-bold text-light-text dark:text-dark-text tracking-tighter leading-[0.9] mb-6">
                VELIMIR <br/>
                MÜLLER.
              </h1>

              <div className="flex items-center gap-4 mb-8">
                 <div className="h-0.5 w-12 bg-brand-600 dark:bg-brand-500"></div>
                 <h2 className="font-mono text-sm md:text-lg text-light-sub dark:text-dark-sub uppercase tracking-widest font-medium">
                    Senior Frontend Engineer
                 </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed text-sm md:text-base border-l-2 border-light-border dark:border-dark-border pl-4">
                Ich übersetze Business-Anforderungen in durchdachte UX/UI-Konzepte und setze sie mit modernem Stack um. Von der Anforderungsanalyse über das Branding bis zum Deployment – alles aus einer Hand.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-12">
               <Button to="/projects" className="bg-brand-600 hover:bg-brand-700 dark:bg-white dark:text-black dark:hover:bg-gray-200">Projekte ansehen</Button>
               <Button to="/contact" variant="outline" className="border-light-border dark:border-dark-border text-light-text dark:text-dark-text">Kontakt</Button>
            </div>
          </div>
        </BentoCard>

        <ImpactMetrics />

        <TechStackGrid />

        <BentoCard className="md:col-span-6 lg:col-span-5 bg-white dark:bg-[#121214]" subtitle="The Person">
           <div className="h-full flex flex-col justify-center relative">
             <div className="absolute top-0 right-0 text-9xl font-serif italic text-black/5 dark:text-white/5 -z-10 translate-x-4 -translate-y-4 font-bold">VM</div>
             <div className="font-mono text-sm text-gray-600 dark:text-gray-300 leading-relaxed z-10">
               <span className="text-4xl float-left mr-3 mt-[-15px] font-serif font-bold text-brand-600 dark:text-brand-500">&ldquo;</span>
               Gutes Frontend beginnt nicht beim Code, sondern beim Verstehen des Business. Ich analysiere Anforderungen, übersetze sie in UX/UI-Konzepte, die zur Marke passen, und plane das Projekt von der Idee bis zum Deployment. Mein Ziel: <strong className="text-light-text dark:text-dark-text">Nahtloser Prozess mit modernen Tools.</strong>
             </div>
             <div className="mt-8 flex items-center gap-4 border-t border-light-border dark:border-dark-border pt-4">
                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-gray-500 border-2 border-white dark:border-[#121214] shadow-sm">VM</div>
                <div>
                   <div className="text-sm font-bold text-light-text dark:text-dark-text">Velimir Müller</div>
                   <div className="text-[10px] text-brand-600 dark:text-brand-500 uppercase tracking-widest font-bold">Frontend Engineer</div>
                </div>
             </div>
           </div>
        </BentoCard>

        <BentoCard className="md:col-span-6 lg:col-span-3 bg-zinc-100 dark:bg-zinc-900 border-none" subtitle="Services">
           <div className="flex flex-col h-full justify-between">
             <div>
               <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">End-to-End</h3>
               <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-4">
                  Von Requirements Engineering über UX/UI-Design bis zum Deployment mit Next.js, Supabase und Vercel.
               </p>
             </div>
             <Link href="/services" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-light-text dark:text-dark-text border-b border-gray-300 dark:border-gray-700 pb-1 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-500 transition-all w-fit group">
                Alle Leistungen <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
             </Link>
           </div>
        </BentoCard>

      </div>
    </div>
  );
}
