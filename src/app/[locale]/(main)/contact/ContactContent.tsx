'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, Linkedin, Github, Check } from 'lucide-react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type HCaptchaClass from '@hcaptcha/react-hcaptcha';

type HCaptchaComponent = typeof HCaptchaClass;

const HCAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;

export default function ContactContent() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [HCaptcha, setHCaptcha] = useState<HCaptchaComponent | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const captchaRef = useRef<HCaptchaClass | null>(null);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const t = useTranslations();

  const validate = (name: string, value: string): string | null => {
    if (name === 'name' && value.length < 2) return t('contact.nameError');
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('contact.emailError');
    if (name === 'message' && value.length < 10) return t('contact.messageError');
    return null;
  };

  const getFieldError = (name: string): string | null => {
    if (!touched[name]) return null;
    return validate(name, formData[name as keyof typeof formData]);
  };

  const isFormValid = !validate('name', formData.name) && !validate('email', formData.email) && !validate('message', formData.message);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  useEffect(() => {
    import('@hcaptcha/react-hcaptcha').then(mod => {
      setHCaptcha(() => mod.default);
    });
  }, []);

  const submitForm = useCallback(async (token: string) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const current = formDataRef.current;
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: current.name,
          email: current.email,
          message: current.message,
          hCaptchaToken: token,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Submission failed');

      setShowSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTouched({});
      setCaptchaToken(null);
      setCaptchaKey(k => k + 1);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    if (submitStatus) {
      const timer = setTimeout(() => setSubmitStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  useEffect(() => {
    if (!showSuccess) return;
    if (countdown <= 0) {
      router.push('/');
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showSuccess, countdown, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showCaptcha = !!(HCAPTCHA_SITEKEY && HCAPTCHA_SITEKEY !== 'YOUR_HCAPTCHA_SITEKEY');

  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token);
    submitForm(token);
  }, [submitForm]);

  const handleCaptchaError = useCallback(() => {
    setIsSubmitting(false);
    setSubmitStatus('error');
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (showCaptcha) {
      if (!captchaRef.current) {
        setIsSubmitting(false);
        setSubmitStatus('error');
        return;
      }
      captchaRef.current.execute();
    } else {
      submitForm('');
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <AnimateIn from="bottom">
        <SectionHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />
      </AnimateIn>

      <AnimateIn from="bottom" delay={100}>
        <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-black/5 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-32 -mt-32 pointer-events-none hidden md:block md:blur-3xl"></div>

          <div className="relative z-10">
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mb-6 animate-scale-in">
                  <Check size={28} className="text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white">{t('contact.successHeading')}</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm">{t('contact.successDescription')}</p>
                <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-brand-500 rounded-full transition-all duration-1000" style={{ width: `${((5 - countdown) / 5) * 100}%` }} />
                </div>
                <p className="text-[11px] text-gray-500 font-mono mt-3">{t('contact.redirecting', { seconds: countdown })}</p>
              </div>
            ) : (
              <>
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
                        onBlur={handleBlur}
                        required
                        className={`w-full bg-gray-50 dark:bg-[#050505] border ${getFieldError('name') ? 'border-red-500' : touched.name ? 'border-green-500' : 'border-black/10 dark:border-white/10'} rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-none font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500`}
                        placeholder={t('contact.namePlaceholder')}
                      />
                      {getFieldError('name') && (
                        <p className="text-xs text-red-500 mt-1 font-mono flex items-center gap-1">
                          <span>&#x2717;</span> {getFieldError('name')}
                        </p>
                      )}
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
                        onBlur={handleBlur}
                        required
                        className={`w-full bg-gray-50 dark:bg-[#050505] border ${getFieldError('email') ? 'border-red-500' : touched.email ? 'border-green-500' : 'border-black/10 dark:border-white/10'} rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-none font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500`}
                        placeholder={t('contact.emailPlaceholder')}
                      />
                      {getFieldError('email') && (
                        <p className="text-xs text-red-500 mt-1 font-mono flex items-center gap-1">
                          <span>&#x2717;</span> {getFieldError('email')}
                        </p>
                      )}
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
                      onBlur={handleBlur}
                      required
                      className={`w-full bg-gray-50 dark:bg-[#050505] border ${getFieldError('message') ? 'border-red-500' : touched.message ? 'border-green-500' : 'border-black/10 dark:border-white/10'} rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-none font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500`}
                      placeholder={t('contact.messagePlaceholder')}
                    ></textarea>
                    {getFieldError('message') && (
                      <p className="text-xs text-red-500 mt-1 font-mono flex items-center gap-1">
                        <span>&#x2717;</span> {getFieldError('message')}
                      </p>
                    )}
                  </div>

                  {showCaptcha && HCaptcha && (
                    <HCaptcha
                      ref={captchaRef}
                      key={captchaKey}
                      sitekey={HCAPTCHA_SITEKEY!}
                      onVerify={handleCaptchaVerify}
                      onExpire={() => { setCaptchaToken(null); setIsSubmitting(false); }}
                      onError={handleCaptchaError}
                      theme="dark"
                      size="invisible"
                    />
                  )}

                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 font-mono text-sm">
                      {t('contact.errorMessage')}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !isFormValid}
                      className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? t('contact.submitting') : t('contact.submitButton')}
                    </Button>
                  </div>
                </form>
              </>
            )}

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
              <a href="https://www.linkedin.com/in/velimir-m%C3%BCller-07b460175" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all group">
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
      </AnimateIn>
    </div>
  );
}
