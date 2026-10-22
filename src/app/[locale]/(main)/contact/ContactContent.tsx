'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, Check } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/atoms/BrandIcons';
import { SectionHeader } from '@/components/molecules/SectionHeader';
// ArtBackdrop: existing atom (src/components/atoms/ArtBackdrop.tsx, PR #60), also used by SectionHeader.
import { ArtBackdrop } from '@/components/atoms/ArtBackdrop';
import { AsciiArt, ASCII_SIGNAL } from '@/components/atoms/AsciiArt';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type HCaptchaClass from '@hcaptcha/react-hcaptcha';
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  contactFieldErrors,
  isContactField,
  type ContactField,
} from '@/utils/contact/schema';

type HCaptchaComponent = typeof HCaptchaClass;

const HCAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;

export default function ContactContent() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [HCaptcha, setHCaptcha] = useState<HCaptchaComponent | null>(null);
  // hCaptcha (a US service) is loaded only once the visitor sends the form,
  // never on page view — see the privacy policy, section on hCaptcha.
  const [captchaRequested, setCaptchaRequested] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  // The field the API refused (400 with `field`); cleared when that field changes.
  const [serverField, setServerField] = useState<ContactField | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const captchaRef = useRef<HCaptchaClass | null>(null);
  // submitForm stays stable for the captcha callbacks and reads the latest
  // form data from this ref, synced after each commit (before any handler).
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);
  const t = useTranslations();

  // Same schema as POST /api/contact (issue #186): trimmed values, min and max length.
  const fieldErrors = contactFieldErrors(formData);
  const isFormValid = CONTACT_FIELDS.every((field) => !fieldErrors[field]);

  const getFieldError = (name: ContactField): string | null => {
    const reason = fieldErrors[name];
    if (touched[name] && reason) {
      const limits: { max?: number } = CONTACT_LIMITS[name];
      if (reason === 'tooLong' && limits.max) return t('contact.tooLongError', { max: limits.max });
      return t(`contact.${name}Error`);
    }
    return serverField === name ? t('contact.serverFieldError') : null;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  useEffect(() => {
    if (!captchaRequested || HCaptcha) return;
    import('@hcaptcha/react-hcaptcha')
      .then(mod => {
        setHCaptcha(() => mod.default);
      })
      .catch(() => {
        // Reset so the next Send tries to load it again.
        setCaptchaRequested(false);
        setIsSubmitting(false);
        setSubmitStatus('error');
      });
  }, [captchaRequested, HCaptcha]);

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
      if (!response.ok) {
        if (isContactField(result.field)) setServerField(result.field);
        throw new Error(result.error || 'Submission failed');
      }

      setShowSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTouched({});
      setCaptchaToken(null);
      setCaptchaKey(k => k + 1);
      // Unmount the widget: a remount would fire onLoad → execute and submit an empty form.
      setCaptchaRequested(false);
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
    if (serverField === e.target.name) setServerField(null);
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
    if (!isFormValid) {
      // Show every field reason; never send what the API would refuse.
      setTouched({ name: true, email: true, message: true });
      return;
    }
    setIsSubmitting(true);

    if (showCaptcha) {
      // First send: load hCaptcha; its onLoad runs the challenge.
      // Later sends (e.g. after an error): the widget is already there.
      if (captchaRef.current) captchaRef.current.execute();
      else setCaptchaRequested(true);
    } else {
      submitForm('');
    }
  };

  return (
    <div className="relative overflow-hidden">
    {/* Full-bleed art: the transmitter sits behind the header and the form; everything overlaps it. */}
    <ArtBackdrop className="bg-[url('/art/v2/site-contact.webp')] bg-size-[auto_100%] md:bg-size-[150%_auto] bg-position-[78%_0%] md:bg-position-[85%_35%] mask-[linear-gradient(to_bottom,black_70%,transparent)]" />
    <div className="relative pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <AnimateIn from="bottom">
        <div className="relative">
          <SectionHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />
          <AsciiArt art={ASCII_SIGNAL} className="absolute right-0 bottom-0 hidden md:block" />
        </div>
      </AnimateIn>

      <AnimateIn from="bottom" delay={100}>
        <div className="glass p-8 md:p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/15 rounded-full -mr-32 -mt-32 pointer-events-none hidden md:block md:blur-3xl"></div>

          <div className="relative z-10">
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mb-6 animate-scale-in">
                  <Check size={28} className="text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white">{t('contact.successHeading')}</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm">{t('contact.successDescription')}</p>
                <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-linear-to-r from-green-500 to-brand-500 rounded-full transition-all duration-1000" style={{ width: `${((5 - countdown) / 5) * 100}%` }} />
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
                        className={`w-full bg-gray-50 dark:bg-[#050505] border ${getFieldError('name') ? 'border-red-500' : touched.name ? 'border-green-500' : 'border-black/10 dark:border-white/10'} rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-hidden font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500`}
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
                        className={`w-full bg-gray-50 dark:bg-[#050505] border ${getFieldError('email') ? 'border-red-500' : touched.email ? 'border-green-500' : 'border-black/10 dark:border-white/10'} rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-hidden font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500`}
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
                      className={`w-full bg-gray-50 dark:bg-[#050505] border ${getFieldError('message') ? 'border-red-500' : touched.message ? 'border-green-500' : 'border-black/10 dark:border-white/10'} rounded-lg p-4 text-black dark:text-white focus:border-black dark:focus:border-white transition-colors outline-hidden font-mono text-sm focus-visible:ring-2 focus-visible:ring-brand-500`}
                      placeholder={t('contact.messagePlaceholder')}
                    ></textarea>
                    {getFieldError('message') && (
                      <p className="text-xs text-red-500 mt-1 font-mono flex items-center gap-1">
                        <span>&#x2717;</span> {getFieldError('message')}
                      </p>
                    )}
                  </div>

                  {showCaptcha && captchaRequested && HCaptcha && (
                    <HCaptcha
                      ref={captchaRef}
                      key={captchaKey}
                      sitekey={HCAPTCHA_SITEKEY!}
                      onLoad={() => captchaRef.current?.execute()}
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
                      track="contact:submit"
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
              <a href="mailto:velimir.mueller@googlemail.com" className="flex items-center gap-4 p-4 rounded-xl glass-inner hover:border-brand-500/50! transition-all group">
                <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300">
                  <Mail size={18}/>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-mono">Email</div>
                  <div className="text-black dark:text-white font-mono text-sm break-all">{t('contact.emailLink')}</div>
                </div>
              </a>
              <a href="https://www.linkedin.com/in/velimir-m%C3%BCller-07b460175" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl glass-inner hover:border-brand-500/50! transition-all group">
                <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300">
                  <LinkedinIcon size={18}/>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-mono">LinkedIn</div>
                  <div className="text-black dark:text-white font-mono text-sm">{t('contact.linkedinLink')}</div>
                </div>
              </a>
              <a href="https://github.com/VelimirMueller" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl glass-inner hover:border-brand-500/50! transition-all group">
                <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300">
                  <GithubIcon size={18}/>
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
    </div>
  );
}
