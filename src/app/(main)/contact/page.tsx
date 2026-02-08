'use client';

import React from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';

export default function ContactPage() {
  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
       <SectionHeader title="CONTACT." subtitle="Get In Touch" />

       <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-black/5 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-32 -mt-32 pointer-events-none hidden md:block md:blur-3xl"></div>

          <div className="relative z-10">
            <p className="text-xl text-black dark:text-white mb-8 font-mono">
               Offen für Projekte und Rollen, in denen ich Business-Anforderungen in durchdachte UX/UI-Konzepte übersetze und mit modernen Tools wie Next.js, Supabase und Vercel umsetze.
            </p>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
               <div className="grid md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="contact-name" className="block font-mono text-xs uppercase text-gray-500 mb-2">Name</label>
                    <input id="contact-name" type="text" autoComplete="name" className="w-full bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-none font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500" placeholder="Ihr Name" />
                 </div>
                 <div>
                    <label htmlFor="contact-email" className="block font-mono text-xs uppercase text-gray-500 mb-2">Email</label>
                    <input id="contact-email" type="email" autoComplete="email" className="w-full bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-none font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500" placeholder="ihre@email.com" />
                 </div>
               </div>
               <div>
                  <label htmlFor="contact-message" className="block font-mono text-xs uppercase text-gray-500 mb-2">Nachricht</label>
                  <textarea id="contact-message" rows={6} className="w-full bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-none font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500" placeholder="Lassen Sie uns sprechen..."></textarea>
               </div>
               <div className="flex justify-end">
                 <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 px-8">Nachricht senden</Button>
               </div>
            </form>

            <div className="mt-12 pt-12 border-t border-black/5 dark:border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
               <a href="mailto:velimir.mueller@googlemail.com" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111] flex items-center justify-center text-gray-500 group-hover:text-black dark:group-hover:text-white border border-black/5 dark:border-white/5">
                     <Mail size={18}/>
                  </div>
                  <div>
                     <div className="text-xs text-gray-500 uppercase font-mono">Email</div>
                     <div className="text-black dark:text-white font-mono text-sm break-all">Kontaktieren</div>
                  </div>
               </a>
               <a href="https://www.linkedin.com/in/velimir-müller-07b460175" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111] flex items-center justify-center text-gray-500 group-hover:text-black dark:group-hover:text-white border border-black/5 dark:border-white/5">
                     <Linkedin size={18}/>
                  </div>
                  <div>
                     <div className="text-xs text-gray-500 uppercase font-mono">LinkedIn</div>
                     <div className="text-black dark:text-white font-mono text-sm">Vernetzen</div>
                  </div>
               </a>
               <a href="https://github.com/VelimirMueller" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111] flex items-center justify-center text-gray-500 group-hover:text-black dark:group-hover:text-white border border-black/5 dark:border-white/5">
                     <Github size={18}/>
                  </div>
                  <div>
                     <div className="text-xs text-gray-500 uppercase font-mono">GitHub</div>
                     <div className="text-black dark:text-white font-mono text-sm">Code ansehen</div>
                  </div>
               </a>
            </div>
          </div>
       </div>
    </div>
  );
}
