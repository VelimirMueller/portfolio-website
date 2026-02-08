'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Code2, Database, Layout, Terminal, Box, Globe } from 'lucide-react';
import { BentoCard } from '@/components/molecules/BentoCard';
import { Button } from '@/components/atoms/Button';

const DashboardPromoVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!isLoaded) {
      video.load();
      video.addEventListener('loadeddata', () => {
        setIsLoaded(true);
        video.play();
        setIsPlaying(true);
      }, { once: true });
      return;
    }
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <BentoCard className="md:col-span-3 lg:col-span-4 bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden group min-h-[320px] border-none p-0">
      <div ref={containerRef} className="relative w-full h-full min-h-[320px]">
        {isInView && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem]"
            width={1280}
            height={720}
            muted
            loop
            playsInline
            preload="none"
            onLoadedData={() => setIsLoaded(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src="/dashboard-promo.mp4" type="video/mp4" />
          </video>
        )}

        {/* Play/pause overlay - always visible, acts as placeholder before load */}
        <button
          onClick={handlePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors cursor-pointer group/play focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-[1.5rem]"
          aria-label={isPlaying ? 'Pause dashboard demo video' : 'Play dashboard demo video'}
        >
          {!isPlaying && (
            <div className="flex flex-col items-center gap-4">
              {/* Placeholder background when not loaded */}
              {!isLoaded && (
                <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 rounded-[1.5rem]">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                </div>
              )}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center shadow-xl border border-white/20 group-hover/play:scale-110 transition-transform">
                  <Play size={24} className="text-black dark:text-white ml-1" aria-hidden="true" />
                </div>
                {!isLoaded && (
                  <div className="text-center">
                    <p className="font-mono text-sm font-bold text-black dark:text-white">Dashboard Demo</p>
                    <p className="text-xs text-gray-500 mt-1">Click to play</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </button>
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
              <item.icon size={16} className="text-light-sub dark:text-dark-sub group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors" aria-hidden="true"/>
              <span className="text-[9px] font-mono text-gray-500 dark:text-gray-400 uppercase">{item.cat}</span>
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
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto relative">
      {/* Animated Gradient Background - Top Third Only */}
      <div className="fixed top-0 left-0 w-[100vw] h-[33vh] overflow-hidden pointer-events-none -z-10">
        {/* Main gradient orbs */}
        <div className="absolute top-0 right-[10%] w-[300px] h-[300px] rounded-full opacity-[0.04] dark:opacity-[0.02] blur-3xl animate-gradient-slow bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600"></div>
        <div className="absolute top-0 left-[10%] w-[250px] h-[250px] rounded-full opacity-[0.04] dark:opacity-[0.02] blur-3xl animate-gradient-slower bg-gradient-to-tr from-cyan-400 via-cyan-500 to-blue-500"></div>
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full opacity-[0.03] dark:opacity-[0.015] blur-3xl animate-gradient-reverse bg-gradient-to-r from-violet-400 to-indigo-500"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-min">

        <BentoCard className="md:col-span-6 lg:col-span-8 min-h-[450px] bg-white dark:bg-[#121214] border-light-border dark:border-dark-border justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-noise pointer-events-none"></div>

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
                 <div className="h-0.5 w-12 bg-brand-600 dark:bg-brand-500" aria-hidden="true"></div>
                 <p className="font-mono text-sm md:text-lg text-light-sub dark:text-dark-sub uppercase tracking-widest font-medium">
                    Senior Frontend Engineer
                 </p>
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

        <DashboardPromoVideo />

        <TechStackGrid />

        <BentoCard className="md:col-span-6 lg:col-span-5 bg-white dark:bg-[#121214]" subtitle="The Person">
           <div className="h-full flex flex-col justify-center relative">
             <div className="absolute top-0 right-0 text-9xl font-serif italic text-black/5 dark:text-white/5 -z-10 translate-x-4 -translate-y-4 font-bold" aria-hidden="true">VM</div>
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
                Alle Leistungen <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
             </Link>
           </div>
        </BentoCard>

      </div>
    </div>
  );
}