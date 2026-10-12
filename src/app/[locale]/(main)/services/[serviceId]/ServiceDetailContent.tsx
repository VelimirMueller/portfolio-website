import React from 'react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { BentoCard } from '@/components/molecules/BentoCard';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { AsciiArt, asciiDivider } from '@/components/atoms/AsciiArt';
import { Check, Zap, Layers, GitBranch, Laptop, Box, type LucideIcon } from 'lucide-react';
import { SectionStage, type StageArt } from '@/components/molecules/SectionStage';
import { useTranslations } from 'next-intl';

type ServiceId = 'requirements-engineering' | 'ux-ui-branding' | 'frontend-development' | 'project-delivery' | 'modern-stack';

const iconMap: Record<ServiceId, LucideIcon> = {
  'requirements-engineering': Laptop,
  'ux-ui-branding': Layers,
  'frontend-development': Box,
  'project-delivery': GitBranch,
  'modern-stack': Zap,
};

// SectionHeader's optional artClassName prop exists since PR #61 (src/components/molecules/SectionHeader.tsx).
// Static strings so Tailwind sees every class (no template literals in class names).
// Large render behind the cards (glass stage, vm-brand B-48).
const stageArt: Record<ServiceId, StageArt> = {
  'requirements-engineering': 'site-svc-requirements',
  'ux-ui-branding': 'site-svc-ux',
  'frontend-development': 'site-svc-frontend',
  'project-delivery': 'site-svc-delivery',
  'modern-stack': 'site-svc-stack',
};

const artMap: Record<ServiceId, string> = {
  'requirements-engineering': "bg-[url('/art/svc-requirements-v1.webp')] bg-cover bg-[position:100%_50%] [mask-image:linear-gradient(to_right,transparent_30%,black_65%,black_85%,transparent),linear-gradient(to_bottom,black_55%,transparent)] [mask-composite:intersect] -top-24 -bottom-8 hidden md:block",
  'ux-ui-branding': "bg-[url('/art/svc-ux-v1.webp')] bg-cover bg-[position:100%_50%] [mask-image:linear-gradient(to_right,transparent_30%,black_65%,black_85%,transparent),linear-gradient(to_bottom,black_55%,transparent)] [mask-composite:intersect] -top-24 -bottom-8 hidden md:block",
  'frontend-development': "bg-[url('/art/svc-frontend-v1.webp')] bg-cover bg-[position:100%_50%] [mask-image:linear-gradient(to_right,transparent_30%,black_65%,black_85%,transparent),linear-gradient(to_bottom,black_55%,transparent)] [mask-composite:intersect] -top-24 -bottom-8 hidden md:block",
  'project-delivery': "bg-[url('/art/svc-delivery-v1.webp')] bg-cover bg-[position:100%_50%] [mask-image:linear-gradient(to_right,transparent_30%,black_65%,black_85%,transparent),linear-gradient(to_bottom,black_55%,transparent)] [mask-composite:intersect] -top-24 -bottom-8 hidden md:block",
  'modern-stack': "bg-[url('/art/svc-stack-v1.webp')] bg-cover bg-[position:100%_50%] [mask-image:linear-gradient(to_right,transparent_30%,black_65%,black_85%,transparent),linear-gradient(to_bottom,black_55%,transparent)] [mask-composite:intersect] -top-24 -bottom-8 hidden md:block",
};

export const ServiceDetailContent = ({ serviceId }: { serviceId: string }) => {
  const t = useTranslations();
  const problems = t.raw(`serviceDetail.${serviceId}.problems`) as string[];
  const process = t.raw(`serviceDetail.${serviceId}.process`) as Record<string, string>[];
  const tech = t.raw(`serviceDetail.${serviceId}.tech`) as string[];

  const Icon = iconMap[serviceId as ServiceId] || Check;

  return (
    <div className="relative overflow-x-clip">
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <AnimateIn from="bottom">
        <SectionHeader
          title={t(`serviceDetail.${serviceId}.title`)}
          subtitle={t(`serviceDetail.${serviceId}.subtitle`)}
          artClassName={artMap[serviceId as ServiceId]}
        />
      </AnimateIn>

      <AsciiArt
        art={asciiDivider(Math.max(1, Object.keys(artMap).indexOf(serviceId) + 1), serviceId.replace(/-/g, ' '))}
        className="-mt-6 md:-mt-10 mb-8 hidden md:block overflow-hidden"
      />

      <SectionStage art={stageArt[serviceId as ServiceId] || 'site-svc-requirements'} side="right">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        <div className="md:col-span-8 space-y-6">
          <AnimateIn from="left" delay={100}>
          <BentoCard variant="glass" className="min-h-[300px]">
             <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-brand-500/10 rounded-xl text-brand-600 dark:text-brand-400">
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
             <BentoCard variant="glass" title={t('serviceDetail.challenges')}>
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
             <BentoCard variant="glass" title={t('serviceDetail.approach')}>
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

        <div className="md:col-span-4 space-y-6">
           <AnimateIn from="right" delay={150}>
           <BentoCard variant="glass" title={t('serviceDetail.techStack')}>
              <div className="flex flex-wrap gap-2 mt-4">
                 {tech.map((item) => (
                    <span key={item} className="glass-inner px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-light-text dark:text-dark-text">
                       {item}
                    </span>
                 ))}
              </div>
           </BentoCard>
           </AnimateIn>

           <AnimateIn from="right" delay={250}>
           <BentoCard variant="glass" className="!border-brand-500/30">
              <h3 className="text-xl font-bold text-light-text dark:text-white mb-2">{t('serviceDetail.interested')}</h3>
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
      </SectionStage>
    </div>
    </div>
  );
};
