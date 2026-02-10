'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/components/language/LanguageProvider';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (submitStatus) {
      const timer = setTimeout(() => setSubmitStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message
          }
        ]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
       <SectionHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />

       <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-black/5 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-32 -mt-32 pointer-events-none hidden md:block md:blur-3xl"></div>

          <div className="relative z-10">
            <p className="text-xl text-black dark:text-white mb-8 font-mono">
               {t('contact.intro')}
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
               <div className="grid md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="contact-name" className="block font-mono text-xs uppercase text-gray-500 mb-2">{t('contact.nameLabel')}</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-none font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
                      placeholder={t('contact.namePlaceholder')}
                    />
                 </div>
                 <div>
                    <label htmlFor="contact-email" className="block font-mono text-xs uppercase text-gray-500 mb-2">{t('contact.emailLabel')}</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-none font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
                      placeholder={t('contact.emailPlaceholder')}
                    />
                 </div>
               </div>
               <div>
                  <label htmlFor="contact-message" className="block font-mono text-xs uppercase text-gray-500 mb-2">{t('contact.messageLabel')}</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-none font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
                    placeholder={t('contact.messagePlaceholder')}
                  ></textarea>
               </div>

               {submitStatus === 'success' && (
                 <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 font-mono text-sm">
                   {t('contact.successMessage')}
                 </div>
               )}

               {submitStatus === 'error' && (
                 <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 font-mono text-sm">
                   {t('contact.errorMessage')}
                 </div>
               )}

               <div className="flex justify-end">
                 <Button
                   type="submit"
                   disabled={isSubmitting}
                   className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isSubmitting ? t('contact.submitting') : t('contact.submitButton')}
                 </Button>
               </div>
            </form>

            <div className="mt-12 pt-12 border-t border-black/5 dark:border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
               <a href="mailto:velimir.mueller@googlemail.com" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111] flex items-center justify-center text-gray-500 group-hover:text-black dark:group-hover:text-white border border-black/5 dark:border-white/5">
                     <Mail size={18}/>
                  </div>
                  <div>
                     <div className="text-xs text-gray-500 uppercase font-mono">Email</div>
                     <div className="text-black dark:text-white font-mono text-sm break-all">{t('contact.emailLink')}</div>
                  </div>
               </a>
               <a href="https://www.linkedin.com/in/velimir-müller-07b460175" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111] flex items-center justify-center text-gray-500 group-hover:text-black dark:group-hover:text-white border border-black/5 dark:border-white/5">
                     <Linkedin size={18}/>
                  </div>
                  <div>
                     <div className="text-xs text-gray-500 uppercase font-mono">LinkedIn</div>
                     <div className="text-black dark:text-white font-mono text-sm">{t('contact.linkedinLink')}</div>
                  </div>
               </a>
               <a href="https://github.com/VelimirMueller" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111] flex items-center justify-center text-gray-500 group-hover:text-black dark:group-hover:text-white border border-black/5 dark:border-white/5">
                     <Github size={18}/>
                  </div>
                  <div>
                     <div className="text-xs text-gray-500 uppercase font-mono">GitHub</div>
                     <div className="text-black dark:text-white font-mono text-sm">{t('contact.githubLink')}</div>
                  </div>
               </a>
            </div>
          </div>
       </div>
    </div>
  );
}
