import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { useTranslations } from 'next-intl';
import { Eyebrow, Tick } from '@/components/atoms/Signature';
import { PanelFrame, glassCard } from '@/components/molecules/GlassPanel';
import { SectionStage, type StageArt } from '@/components/molecules/SectionStage';
import { SectionDivider } from '@/components/molecules/SectionDivider';

// Home in the VM. flagship look (vm-brand PLAYBOOK B-34, README v2 / profile v4): one indigo accent,
// dark art with a fading grid, "// LABEL" eyebrows, numbered art dividers. Copy lives in locales/*.json (home.*).

type Stat = { value: string; label: string };
type Card = { title: string; text: string; tags?: string };
type Role = { org: string; role: string; time: string; current?: boolean };
type Flagship = { key: string; name: string; status: string; label: string; text: string; href: string; cta: string };
type Step = { title: string; text: string; hot?: boolean };
type StackRow = { area: string; items: string };
type SectionKey = 'practice' | 'experience' | 'flagships' | 'system' | 'capabilities';

const FLAGSHIP_ART: Record<string, string> = {
  synthwerk: "bg-[url('/art/v2/synthwerk.webp')]",
  'code-context-mcp': "bg-[url('/art/v2/code-context-mcp.webp')]",
  'claude-skills': "bg-[url('/art/v2/claude-skills.webp')]",
};

const panel = 'glass rounded-[1.5rem] overflow-hidden';
const card = glassCard;

const SECTION: Record<SectionKey, { art: StageArt; side: 'left' | 'right'; strip: 1 | 2 | 3 | 4 | 5 }> = {
  practice: { art: 'site-svc-requirements', side: 'right', strip: 1 },
  experience: { art: 'site-svc-delivery', side: 'left', strip: 2 },
  flagships: { art: 'site-svc-ux', side: 'right', strip: 3 },
  system: { art: 'site-svc-stack', side: 'left', strip: 4 },
  capabilities: { art: 'site-svc-frontend', side: 'right', strip: 5 },
};

const Section = ({ id, total, children }: { id: SectionKey; total: number; children: React.ReactNode }) => {
  const t = useTranslations('home');
  const s = t.raw(`sections.${id}`) as { index: string; title: string; caption: string };
  return (
    <SectionStage art={SECTION[id].art} side={SECTION[id].side}>
      <SectionDivider id={id} index={s.index} total={total} title={s.title} caption={s.caption} countLabel={t('sectionCount')} strip={SECTION[id].strip} />
      {children}
    </SectionStage>
  );
};

const Hero = () => {
  const t = useTranslations('home');
  const stats = t.raw('stats') as Stat[];
  return (
    <>
      <AnimateIn from="bottom">
        <section className="relative rounded-[1.5rem] overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-[#0a0a0b] min-h-[520px] md:min-h-[560px]">
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,#8080800f_1px,transparent_1px),linear-gradient(to_bottom,#8080800f_1px,transparent_1px)] bg-[size:32px_32px]" />
          {/* Dark: full-bleed art, faded out under the text column. Light: the art sits in an inset window (B-6). */}
          <div aria-hidden="true" className="hidden dark:block absolute inset-0 bg-[url('/art/v2/flagship-base.webp')] bg-cover bg-center" />
          <div aria-hidden="true" className="hidden dark:block absolute inset-0 bg-[linear-gradient(to_right,rgba(10,10,11,0.96),rgba(10,10,11,0.82)_40%,rgba(10,10,11,0)_62%)]" />
          <div aria-hidden="true" className="dark:hidden hidden md:block absolute top-6 bottom-6 right-6 w-[46%] rounded-2xl bg-[url('/art/v2/flagship-base.webp')] bg-cover bg-center border border-light-border" />
          <div aria-hidden="true" className="absolute top-1/2 right-[20%] w-[30%] h-1/2 rounded-full bg-brand-500/20 blur-[100px]" />

          <div className="relative z-10 p-7 md:p-14 flex flex-col justify-between min-h-[520px] md:min-h-[560px] max-w-2xl">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-600/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono uppercase tracking-[0.18em]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                {t('badge')}
              </span>
              <p className="mt-9 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">{t('eyebrow')}</p>
              <h1 className="mt-3 font-mono font-bold tracking-tighter leading-[0.9] text-5xl sm:text-6xl lg:text-7xl text-light-text dark:text-white">
                VELIMIR<br />MÜLLER.
              </h1>
              <div className="mt-7 flex gap-4">
                <Tick wide className="mt-3" />
                <div>
                  <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300">{t('tagline')}</p>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">{t('sub')}</p>
                </div>
              </div>
              <p className="mt-7 max-w-xl text-sm md:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 border-l-2 border-light-border dark:border-dark-border pl-4">
                {t('description')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-10">
              <Button to="/projects" track="hero:projects" className="bg-brand-600 hover:bg-brand-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200">{t('ctaProjects')}</Button>
              <Button to="/contact" track="hero:contact" variant="outline" className="border-light-border dark:border-dark-border text-light-text dark:text-dark-text">{t('ctaContact')}</Button>
            </div>
          </div>
        </section>
      </AnimateIn>

      <AnimateIn from="bottom" delay={100}>
        <section className={`${panel} mt-4 p-6 md:p-10`} aria-label={t('statsLabel')}>
          <PanelFrame />
          <Eyebrow>{t('statsLabel')}</Eyebrow>
          <dl className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {stats.map((s) => (
              <div key={s.label} className={`${card} p-5 md:p-7`}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-mono font-bold tracking-tight text-3xl md:text-5xl text-brand-600 dark:text-brand-400">{s.value}</dd>
                <dd className="mt-3 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 leading-relaxed hyphens-auto break-words">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>
      </AnimateIn>
    </>
  );
};

const CardGrid = ({ label, items, cols }: { label: string; items: Card[]; cols: string }) => (
  <section className={`${panel} p-6 md:p-10`}>
    <PanelFrame />
    <Eyebrow>{label}</Eyebrow>
    <div className={`relative grid grid-cols-1 gap-4 md:gap-5 ${cols}`}>
      {items.map((c, i) => (
        <div key={c.title} className={`${card} p-6 md:p-7 flex flex-col`}>
          <div className="flex items-start justify-between">
            <Tick className="mb-6" />
            <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{String(i + 1).padStart(2, '0')}</span>
          </div>
          <h3 className="text-xl font-semibold text-light-text dark:text-zinc-100">{c.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">{c.text}</p>
          {c.tags && <p className="mt-auto pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{c.tags}</p>}
        </div>
      ))}
    </div>
  </section>
);

const Practice = () => {
  const t = useTranslations('home');
  return (
    <AnimateIn from="bottom">
      <CardGrid label={t('practiceLabel')} items={t.raw('practice') as Card[]} cols="md:grid-cols-3" />
      <Link href="/services" className="mt-5 inline-flex items-center gap-2 font-mono text-xs font-bold text-light-text dark:text-dark-text border-b border-zinc-300 dark:border-zinc-700 pb-1 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group">
        {t('allServices')} <ArrowRight size={12} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </AnimateIn>
  );
};

const Experience = () => {
  const t = useTranslations('home');
  const roles = t.raw('roles') as Role[];
  return (
    <AnimateIn from="bottom" className="space-y-4">
      <p className="max-w-3xl text-base md:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">{t('experienceIntro')}</p>
      <CardGrid label={t('ownLabel')} items={t.raw('own') as Card[]} cols="sm:grid-cols-2 lg:grid-cols-4" />
      <section className={`${panel} p-6 md:p-10`}>
        <PanelFrame />
        <Eyebrow>{t('rolesLabel')}</Eyebrow>
        <ol className="relative space-y-2.5">
          {roles.map((r) => (
            <li key={r.org} className={`${card} px-5 py-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-6`}>
              <span aria-hidden="true" className={`hidden md:block w-3 h-3 rounded-full shrink-0 ${r.current ? 'bg-emerald-500' : 'border-[1.5px] border-zinc-400 dark:border-zinc-600'}`} />
              <span className="font-semibold text-light-text dark:text-zinc-100 md:w-72">{r.org}</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400 flex-1">{r.role}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 flex items-center gap-2">
                {r.current && <span className="text-emerald-700 dark:text-emerald-400">{t('current')} ·</span>}{r.time}
              </span>
            </li>
          ))}
        </ol>
        <Link href="/about" className="relative mt-6 inline-flex items-center gap-2 font-mono text-xs font-bold text-light-text dark:text-dark-text border-b border-zinc-300 dark:border-zinc-700 pb-1 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group">
          {t('experienceCta')} <ArrowRight size={12} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </AnimateIn>
  );
};

const Flagships = () => {
  const t = useTranslations('home');
  const items = t.raw('flagships') as Flagship[];
  return (
    <div className="space-y-4">
      {items.map((f, i) => (
        <AnimateIn key={f.key} from="bottom" delay={i * 80}>
          <a href={f.href} target="_blank" rel="noopener noreferrer" className={`${panel} group grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4 p-4 md:p-5 hover:border-brand-500/50 transition-colors`}>
            <div className="relative h-48 md:h-auto md:min-h-[240px] rounded-2xl overflow-hidden bg-[#08080a] border border-[#26262b]">
              <div aria-hidden="true" className={`absolute inset-0 bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-700 ${FLAGSHIP_ART[f.key]}`} />
            </div>
            <div className={`${card} relative p-6 md:p-8 flex flex-col`}>
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-600/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono uppercase tracking-[0.18em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />{f.status}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{String(i + 1).padStart(2, '0')} / Flagship</span>
              </div>
              <h3 className="mt-6 font-mono font-bold tracking-tighter text-3xl md:text-5xl text-light-text dark:text-white">{f.name}</h3>
              <div className="mt-4 flex items-center gap-4">
                <Tick wide />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">{f.label}</span>
              </div>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 border-l-2 border-light-border dark:border-[#26262b] pl-4">{f.text}</p>
              <span className="mt-auto pt-6 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-light-text dark:text-dark-text group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {f.cta} <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </div>
          </a>
        </AnimateIn>
      ))}
    </div>
  );
};

const DeliverySystem = () => {
  const t = useTranslations('home');
  const steps = t.raw('pipeline') as Step[];
  return (
    <AnimateIn from="bottom" className="space-y-4">
      <section className={`${panel} p-6 md:p-10`}>
        <PanelFrame />
        <Eyebrow>{t('pipelineLabel')}</Eyebrow>
        <ol className="relative grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-0">
          {steps.map((s, i) => (
            <li key={s.title} className="flex md:items-stretch">
              <div className={`${card} flex-1 p-5 ${s.hot ? '!border-brand-500 ring-1 ring-brand-500/30' : ''}`}>
                <span aria-hidden="true" className="block w-5 h-0.5 bg-brand-500 mb-4" />
                <p className="font-mono font-bold text-light-text dark:text-zinc-100">{s.title}</p>
                <p className="mt-1.5 text-sm leading-snug text-zinc-600 dark:text-zinc-400">{s.text}</p>
              </div>
              {i < steps.length - 1 && <span aria-hidden="true" className="hidden md:flex items-center px-2 text-brand-500"><ArrowRight size={16} /></span>}
            </li>
          ))}
        </ol>
        <p className="relative mt-6 text-sm text-zinc-500">{t('pipelineNote')}</p>
      </section>
      <CardGrid label={t('controlsLabel')} items={t.raw('controls') as Card[]} cols="sm:grid-cols-2 lg:grid-cols-4" />
      <figure className={`${panel} px-8 py-10 md:px-16 md:py-14`}>
        <PanelFrame />
        <blockquote className="relative border-l-[3px] border-brand-500 pl-6 md:pl-8 text-2xl md:text-4xl font-semibold tracking-tight text-light-text dark:text-zinc-100">
          {t('quote')}
        </blockquote>
        <figcaption className="relative mt-5 pl-6 md:pl-8 font-mono text-xs uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">— {t('quoteBy')}</figcaption>
      </figure>
    </AnimateIn>
  );
};

const Capabilities = () => {
  const t = useTranslations('home');
  const rows = t.raw('stack') as StackRow[];
  return (
    <AnimateIn from="bottom">
      <section className={`${panel} p-6 md:p-10`}>
        <PanelFrame />
        <Eyebrow>{t('stackLabel')}</Eyebrow>
        <dl className="relative space-y-2.5">
          {rows.map((r) => (
            <div key={r.area} className={`${card} px-5 py-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-6`}>
              <span aria-hidden="true" className="hidden md:block w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <dt className="font-semibold text-light-text dark:text-zinc-100 md:w-40">{r.area}</dt>
              <dd className="font-mono text-[11px] md:text-xs uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400 md:ml-auto md:text-right">{r.items}</dd>
            </div>
          ))}
        </dl>
      </section>
    </AnimateIn>
  );
};

const ContactBand = () => {
  const t = useTranslations('home');
  return (
    <AnimateIn from="bottom" className="mt-24 md:mt-32">
      <section className="relative rounded-[1.5rem] overflow-hidden border border-light-border dark:border-[#26262b] bg-[#08080a] min-h-[320px] flex items-center">
        <div aria-hidden="true" className="absolute inset-0 bg-[url('/art/v2/site-contact.webp')] bg-cover bg-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,10,11,0.95),rgba(10,10,11,0.75)_45%,rgba(10,10,11,0.15))]" />
        <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-[3px] bg-brand-500/85" />
        <div className="relative p-8 md:p-14 max-w-xl">
          <h2 className="font-mono font-bold tracking-tight text-3xl md:text-4xl text-zinc-100">{t('contactTitle')}</h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">{t('contactText')}</p>
          <Button to="/contact" track="home:contact-band" className="mt-8 bg-white text-black hover:bg-zinc-200">{t('contactCta')}</Button>
        </div>
      </section>
    </AnimateIn>
  );
};

export default function HomeContent() {
  const total = 5;
  return (
    <div className="relative overflow-x-clip">
      <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto relative">
        <Hero />
        <Section id="practice" total={total}><Practice /></Section>
        <Section id="experience" total={total}><Experience /></Section>
        <Section id="flagships" total={total}><Flagships /></Section>
        <Section id="system" total={total}><DeliverySystem /></Section>
        <Section id="capabilities" total={total}><Capabilities /></Section>
        <ContactBand />
      </div>
    </div>
  );
}
