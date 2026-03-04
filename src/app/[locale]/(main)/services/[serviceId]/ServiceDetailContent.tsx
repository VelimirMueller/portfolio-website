'use client';

import React from 'react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { BentoCard } from '@/components/molecules/BentoCard';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { Check, Zap, Layers, GitBranch, Laptop, Box, type LucideIcon } from 'lucide-react';
import { useLanguage, useTranslationArray, useTranslationObjectArray } from '@/components/language/LanguageProvider';

type ServiceId = 'requirements-engineering' | 'ux-ui-branding' | 'frontend-development' | 'project-delivery' | 'modern-stack';

const iconMap: Record<ServiceId, LucideIcon> = {
  'requirements-engineering': Laptop,
  'ux-ui-branding': Layers,
  'frontend-development': Box,
  'project-delivery': GitBranch,
  'modern-stack': Zap,
};

export const ServiceDetailContent = ({ serviceId }: { serviceId: string }) => {
  const { t } = useLanguage();
  const problems = useTranslationArray(`serviceDetail.${serviceId}.problems`);
  const process = useTranslationObjectArray(`serviceDetail.${serviceId}.process`);
  const tech = useTranslationArray(`serviceDetail.${serviceId}.tech`);

  const Icon = iconMap[serviceId as ServiceId] || Check;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <AnimateIn from="bottom">
        <SectionHeader title={t(`serviceDetail.${serviceId}.title`)} subtitle={t(`serviceDetail.${serviceId}.subtitle`)} />
      </AnimateIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-8 space-y-6">
          <AnimateIn from="left" delay={100}>
          <BentoCard className="bg-white dark:bg-[#111] min-h-[300px]">
             <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 text-black dark:text-white">
                   <Icon size={32} />
                </div>
                <div>
                   <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-4">{t(`serviceDetail.${serviceId}.title`)}</h2>
                   <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-2xl">
                      {t(`serviceDetail.${serviceId}.description`)}
                   </p>
                </div>
             </div>
          </BentoCard>
          </AnimateIn>

          <div className="grid md:grid-cols-2 gap-6">
             <AnimateIn from="bottom-left" delay={200}>
             <BentoCard className="bg-gray-50 dark:bg-[#0A0A0A]" title={t('serviceDetail.challenges')}>
                <ul className="space-y-3 mt-4">
                   {problems.map((prob, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                         <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                         {prob}
                      </li>
                   ))}
                </ul>
             </BentoCard>
             </AnimateIn>

             <AnimateIn from="bottom-right" delay={250}>
             <BentoCard className="bg-gray-50 dark:bg-[#0A0A0A]" title={t('serviceDetail.approach')}>
                <ul className="space-y-4 mt-4">
                   {process.map((step, i) => (
                      <li key={i} className="flex gap-3">
                         <span className="font-mono text-xs text-gray-500 pt-0.5">0{i+1}</span>
                         <div>
                            <div className="text-black dark:text-white text-sm font-bold">{step.title}</div>
                            <div className="text-xs text-gray-500">{step.desc}</div>
                         </div>
                      </li>
                   ))}
                </ul>
             </BentoCard>
             </AnimateIn>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <AnimateIn from="right" delay={150}>
           <BentoCard className="bg-[#E5E5E5] dark:bg-[#E2E2E2] !text-black" title={t('serviceDetail.techStack')}>
              <div className="flex flex-wrap gap-2 mt-4">
                 {tech.map((item) => (
                    <span key={item} className="px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-mono font-bold">
                       {item}
                    </span>
                 ))}
              </div>
           </BentoCard>
           </AnimateIn>

           <AnimateIn from="right" delay={250}>
           <BentoCard className="bg-blue-50 dark:bg-blue-900/10 border-blue-500/20">
              <h3 className="text-xl font-bold text-blue-900 dark:text-white mb-2">{t('serviceDetail.interested')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                 {t('serviceDetail.interestedDesc')}
              </p>
              <Button to="/contact" className="w-full">
                 {t(`serviceDetail.${serviceId}.cta`)}
              </Button>
           </BentoCard>
           </AnimateIn>
        </div>

      </div>
    </div>
  );
};
