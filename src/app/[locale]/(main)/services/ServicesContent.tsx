import React from 'react';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Palette, Laptop, Rocket, Wrench } from 'lucide-react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { Eyebrow } from '@/components/atoms/Signature';
import { GlassPanel, glassCard } from '@/components/molecules/GlassPanel';
import { SectionStage, STAGE_ART } from '@/components/molecules/SectionStage';
import { SectionDivider } from '@/components/molecules/SectionDivider';
import { useTranslations } from 'next-intl';

// Services in the glass look (vm-brand B-48): 01 offer, 02 the five services with their renders.

type StageCopy = { index: string; title: string; caption: string };

// Card art = the stage renders, so the page loads each image once.
const SERVICES = [
  { key: 'requirementsEngineering', icon: ClipboardList, path: '/services/requirements-engineering', art: STAGE_ART['site-svc-requirements'] },
  { key: 'uxUiBranding', icon: Palette, path: '/services/ux-ui-branding', art: STAGE_ART['site-svc-ux'] },
  { key: 'frontendDevelopment', icon: Laptop, path: '/services/frontend-development', art: STAGE_ART['site-svc-frontend'] },
  { key: 'projectDelivery', icon: Rocket, path: '/services/project-delivery', art: STAGE_ART['site-svc-delivery'] },
  { key: 'modernStack', icon: Wrench, path: '/services/modern-stack', art: STAGE_ART['site-svc-stack'] },
];

export default function ServicesContent() {
  const t = useTranslations();
  const valueItems = t.raw('services.valueItems') as string[];
  const offer = t.raw('services.stages.offer') as StageCopy;
  const list = t.raw('services.stages.services') as StageCopy;
  const count = t('home.sectionCount');

  return (
    <div className="relative overflow-x-clip">
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <AnimateIn from="bottom">
        <SectionHeader title={t('services.title')} subtitle={t('services.subtitle')} artClassName="bg-[url('/art/services-v1.webp')] bg-cover bg-position-[100%_60%] mask-[linear-gradient(to_right,transparent_30%,black_65%,black_85%,transparent),linear-gradient(to_bottom,black_55%,transparent)] mask-intersect -top-24 -bottom-8 hidden md:block" />
      </AnimateIn>

      <SectionStage art="site-svc-requirements" side="right">
        <SectionDivider id="offer" index={offer.index} total={2} title={offer.title} caption={offer.caption} countLabel={count} strip={1} className="mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <AnimateIn from="left" delay={100} className="lg:col-span-8">
            <GlassPanel className="h-full p-6 md:p-10 min-h-[400px]">
              <h3 className="relative text-2xl md:text-3xl font-mono font-bold text-light-text dark:text-dark-text">{t('services.heroTitle')}</h3>
              <div className="relative mt-6 grid md:grid-cols-2 gap-6 md:gap-10">
                <div className="flex flex-col justify-between">
                  <p className="text-lg font-medium leading-relaxed mb-8 text-zinc-800 dark:text-zinc-200">
                    {t('services.heroDesc')} <strong className="text-zinc-900 dark:text-white">{t('services.heroDescBold')}</strong>{t('services.heroDescAfter')}
                  </p>
                  <div className="space-y-3">
                    {[[ClipboardList, 'services.pipeline1'], [Rocket, 'services.pipeline2']].map(([Icon, k]) => {
                      const I = Icon as typeof ClipboardList;
                      return (
                        <div key={k as string} className={`${glassCard} flex items-center gap-3 p-3`}>
                          <I className="text-brand-600 dark:text-brand-400" size={20} aria-hidden="true" />
                          <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{t(k as string)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={`${glassCard} p-6`}>
                  <Eyebrow>{t('services.valueAdd')}</Eyebrow>
                  <ul className="space-y-4">
                    {valueItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-800 dark:text-zinc-200">
                        <div className="mt-1 min-w-[16px] h-4 rounded-full bg-brand-600 dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-mono">&#10003;</div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10">
                    <Button to="/contact" variant="brand" className="w-full">
                      {t('services.checkAvailability')}
                    </Button>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </AnimateIn>

          <AnimateIn from="right" delay={200} className="lg:col-span-4">
            <GlassPanel className="h-full p-6">
              <Eyebrow>{t('services.detailTitle')}</Eyebrow>
              <div className="relative space-y-3">
                {SERVICES.map((service) => (
                  <Link key={service.key} href={service.path} className={`${glassCard} flex items-center gap-4 p-3 hover:border-brand-500/50! transition-colors group`}>
                    <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <service.icon size={18} aria-hidden="true" />
                    </div>
                    <div className="flex-1 text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">{t(`services.serviceNames.${service.key}`)}</div>
                    <ArrowRight size={14} aria-hidden="true" className="text-zinc-400 dark:text-zinc-600 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </GlassPanel>
          </AnimateIn>
        </div>
      </SectionStage>

      <SectionStage art="site-svc-ux" side="left">
        <SectionDivider id="services" index={list.index} total={2} title={list.title} caption={list.caption} countLabel={count} strip={2} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SERVICES.map((s, i) => (
            <AnimateIn key={s.key} from="bottom" delay={i * 60}>
              <Link href={s.path} className="group relative flex flex-col justify-end h-80 rounded-3xl overflow-hidden border border-light-border dark:border-[#26262b] bg-[#08080a] hover:border-brand-500/60 transition-colors">
                <div aria-hidden="true" className={`absolute inset-0 bg-cover bg-center group-hover:scale-[1.04] transition-transform duration-700 ${s.art}`} />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,11,0.05),rgba(10,10,11,0.35)_45%,rgba(10,10,11,0.94))]" />
                <div className="relative p-6">
                  <span className="font-mono text-2xl font-bold text-brand-400">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 text-lg font-semibold text-zinc-100">{t(`services.serviceNames.${s.key}`)}</h3>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-300 group-hover:text-brand-400 transition-colors">
                    {t('services.more')} <ArrowRight size={12} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </AnimateIn>
          ))}
        </div>
      </SectionStage>
    </div>
    </div>
  );
}
