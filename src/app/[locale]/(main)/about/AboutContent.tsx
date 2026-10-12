import React from 'react';
import { Terminal } from 'lucide-react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { Eyebrow } from '@/components/atoms/Signature';
import { GlassPanel, glassCard } from '@/components/molecules/GlassPanel';
import { SectionStage } from '@/components/molecules/SectionStage';
import { SectionDivider } from '@/components/molecules/SectionDivider';
import { ExperienceTimeline } from '@/components/molecules/ExperienceTimeline';
import { useLocale, useTranslations } from 'next-intl';
import { getPositioning } from '@/config/positioning';

// About in the glass look (vm-brand B-48): two stages, 01 profile and 02 experience.

type StageCopy = { index: string; title: string; caption: string };

const SKILLS: [string, string[]][] = [
  ['frontend', ['React', 'Vue', 'Next.js', 'Nuxt', 'TypeScript', 'Tailwind']],
  ['backend', ['FastAPI', 'Quarkus', 'PostgreSQL', 'Supabase', 'Laravel']],
  ['infrastructure', ['AWS', 'Azure', 'Terraform', 'Docker', 'Vercel']],
  ['process', ['Requirements Engineering', 'UX/UI', 'Figma']],
  ['ai', ['GitHub Copilot', 'Claude', 'ChatGPT']],
  ['ml', ['Python', 'scikit-learn', 'pandas', 'Feature Engineering']],
];

const EXPERIENCE = ['exp1', 'exp2', 'exp3', 'exp4', 'exp5', 'exp6', 'exp7'];

export default function AboutContent() {
  const t = useTranslations();
  const { jobTitle } = getPositioning(useLocale());
  const stage = (key: string) => t.raw(`about.stages.${key}`) as StageCopy;
  const profile = stage('profile');
  const experience = stage('experience');
  const count = t('home.sectionCount');

  return (
    <div className="relative overflow-x-clip">
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <AnimateIn from="bottom">
        <SectionHeader title={t('about.title')} subtitle={t('about.subtitle')} artClassName="bg-[url('/art/about-v1.webp')] bg-cover bg-[position:100%_50%] [mask-image:linear-gradient(to_right,transparent_30%,black_65%,black_85%,transparent),linear-gradient(to_bottom,black_55%,transparent)] [mask-composite:intersect] -top-24 -bottom-8 hidden md:block" />
      </AnimateIn>

      <SectionStage art="site-svc-requirements" side="right">
        <SectionDivider id="profile" index={profile.index} total={2} title={profile.title} caption={profile.caption} countLabel={count} strip={1} className="mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Bio */}
          <AnimateIn from="left" delay={100} className="lg:col-span-8">
            <GlassPanel className="h-full p-6 md:p-10 min-h-[400px]">
              <Eyebrow>{t('about.summary')}</Eyebrow>
              <div className="relative prose dark:prose-invert prose-lg max-w-none">
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <span className="text-black dark:text-white font-bold">{jobTitle}</span> {t('about.bio1After')}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{t('about.bio2')}</p>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{t('about.bio3')}</p>
              </div>
              <div className="relative mt-8 grid grid-cols-3 gap-3 md:gap-4">
                {[['4', 'about.yearsExp'], ['E2E', 'about.reqDeploy'], ['UX', 'about.uiBranding']].map(([v, k]) => (
                  <div key={k} className={`${glassCard} p-4 md:p-5`}>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-brand-600 dark:text-brand-400">{v}</div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(k)}</div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </AnimateIn>

          {/* Tech stack terminal */}
          <AnimateIn from="right" delay={200} className="lg:col-span-4">
            <GlassPanel className="h-full" frame={false}>
              <div className="flex items-center gap-2 px-5 py-3 border-b border-black/5 dark:border-white/10">
                <Terminal size={14} className="text-zinc-500" aria-hidden="true" />
                <span className="text-xs font-mono text-zinc-500">skills.json</span>
              </div>
              <div className="p-5 font-mono text-sm space-y-4">
                {SKILLS.map(([key, items]) => (
                  <div key={key}>
                    <div className="text-brand-600 dark:text-brand-400 mb-1">&quot;{key}&quot;:</div>
                    <div className="pl-4 text-emerald-700 dark:text-emerald-400">[{items.map((i) => `"${i}"`).join(', ')}]</div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </AnimateIn>
        </div>
      </SectionStage>

      <SectionStage art="site-svc-delivery" side="left">
        <SectionDivider id="experience" index={experience.index} total={2} title={experience.title} caption={experience.caption} countLabel={count} strip={2} />
        <AnimateIn from="bottom" delay={100}>
          <GlassPanel className="p-6 md:p-10">
            <Eyebrow>{t('about.experienceLog')}</Eyebrow>
            <ExperienceTimeline
              className="mt-2"
              currentLabel={t('about.current')}
              entries={EXPERIENCE.map((id) => ({
                id,
                title: t(`about.${id}.title`),
                tag: t(`about.${id}.tag`),
                company: t(`about.${id}.company`),
                date: t(`about.${id}.date`),
                desc: t(`about.${id}.desc`),
              }))}
            />
          </GlassPanel>
        </AnimateIn>
      </SectionStage>
    </div>
    </div>
  );
}
