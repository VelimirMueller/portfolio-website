import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { BrandAurora } from '@/components/effects/BrandAurora';
import { useTranslations } from 'next-intl';

// Home as a bento grid in the VM. flagship look (vm-brand PLAYBOOK B-34, profile v4): one indigo accent,
// dark art with a fading grid, "// LABEL" eyebrows. Copy lives in locales/*.json (home.*).

type Stat = { value: string; label: string };
type Card = { title: string; text: string; tags?: string };
type Role = { org: string; role: string; time: string; current?: boolean };
type Flagship = { key: string; name: string; status: string; label: string; text: string; href: string; cta: string };
type Step = { title: string; text: string; hot?: boolean };
type StackRow = { area: string; items: string };

const tile = 'relative h-full rounded-[1.5rem] border border-light-border dark:border-dark-border bg-white dark:bg-[#0c0c0e] overflow-hidden';
const inner = 'rounded-2xl border border-light-border dark:border-[#26262b] bg-light-bg dark:bg-[#111113]';
const link = 'inline-flex items-center gap-2 font-mono text-xs font-bold text-light-text dark:text-dark-text border-b border-zinc-300 dark:border-zinc-700 pb-1 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors w-fit group';

/** Grid fading out from the top plus one soft indigo glow: the frame of every kit panel. */
const Frame = () => (
  <>
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#8080800f_1px,transparent_1px),linear-gradient(to_bottom,#8080800f_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_75%)]" />
    <div aria-hidden="true" className="absolute -top-32 right-0 w-2/3 h-64 rounded-full bg-brand-500/10 dark:bg-brand-500/15 blur-[90px] pointer-events-none" />
  </>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-5">{'// '}{children}</p>
);

const Tick = ({ className = 'mb-4' }: { className?: string }) => <span aria-hidden="true" className={`block w-5 h-0.5 bg-brand-500 ${className}`} />;

const Pill = ({ children, pulse }: { children: React.ReactNode; pulse?: boolean }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-600/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono uppercase tracking-[0.18em] w-fit">
    <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${pulse ? 'animate-pulse' : ''}`} aria-hidden="true" />{children}
  </span>
);

const Hero = () => {
  const t = useTranslations('home');
  return (
    <section className={`${tile} min-h-[480px] dark:bg-[#0a0a0b]`}>
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,#8080800f_1px,transparent_1px),linear-gradient(to_bottom,#8080800f_1px,transparent_1px)] bg-[size:32px_32px]" />
      {/* Dark: full-bleed art, faded out under the text column. Light: the art sits in an inset window (B-6). */}
      <div aria-hidden="true" className="hidden dark:md:block absolute inset-0 bg-[url('/art/v2/flagship-base.webp')] bg-cover bg-[position:70%_50%]" />
      <div aria-hidden="true" className="hidden dark:block absolute inset-0 bg-[linear-gradient(to_right,rgba(10,10,11,0.97),rgba(10,10,11,0.85)_45%,rgba(10,10,11,0)_75%)]" />
      <div aria-hidden="true" className="dark:hidden hidden lg:block absolute top-5 bottom-5 right-5 w-[34%] rounded-2xl bg-[url('/art/v2/flagship-base.webp')] bg-cover bg-[position:72%_45%] border border-light-border" />
      <div aria-hidden="true" className="absolute top-1/2 right-[15%] w-1/3 h-1/2 rounded-full bg-brand-500/20 blur-[100px]" />

      <div className="relative z-10 p-7 md:p-12 flex flex-col justify-between h-full min-h-[480px] lg:max-w-[64%]">
        <div>
          <Pill pulse>{t('badge')}</Pill>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">{t('eyebrow')}</p>
          <h1 className="mt-3 font-mono font-bold tracking-tighter leading-[0.9] text-5xl sm:text-6xl lg:text-7xl text-light-text dark:text-white">
            VELIMIR<br />MÜLLER.
          </h1>
          <div className="mt-6 flex gap-4">
            <span aria-hidden="true" className="mt-3 w-11 h-0.5 shrink-0 bg-brand-500" />
            <div>
              <p className="text-lg text-zinc-700 dark:text-zinc-300">{t('tagline')}</p>
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">{t('sub')}</p>
            </div>
          </div>
          <p className="mt-6 text-sm md:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 border-l-2 border-light-border dark:border-dark-border pl-4">
            {t('description')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          <Button to="/projects" track="hero:projects" className="bg-brand-600 hover:bg-brand-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200">{t('ctaProjects')}</Button>
          <Button to="/contact" track="hero:contact" variant="outline" className="border-light-border dark:border-dark-border text-light-text dark:text-dark-text">{t('ctaContact')}</Button>
        </div>
      </div>
    </section>
  );
};

const CodeContextCard = ({ f }: { f: Flagship }) => (
  <a href={f.href} target="_blank" rel="noopener noreferrer" className={`${tile} group flex flex-col min-h-[480px] hover:border-brand-500/50 transition-colors`}>
    <div className="relative h-52 shrink-0 bg-[#08080a]">
      <div aria-hidden="true" className="absolute inset-0 bg-[url('/art/v2/code-context-mcp.webp')] bg-cover bg-center group-hover:scale-[1.04] transition-transform duration-700" />
      <div aria-hidden="true" className="hidden dark:block absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0c0c0e] to-transparent" />
    </div>
    <div className="relative p-6 md:p-7 flex flex-col flex-1">
      <Pill>{f.status}</Pill>
      <h2 className="mt-4 font-mono font-bold tracking-tighter text-3xl text-light-text dark:text-white">{f.name}</h2>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">{f.label}</p>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{f.text}</p>
      <code className="mt-5 block rounded-lg bg-zinc-900 text-zinc-100 px-4 py-2.5 font-mono text-xs"><span className="text-brand-400">$</span> npm i vlm-code-context-mcp</code>
      <span className="mt-auto pt-5 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-light-text dark:text-dark-text group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {f.cta} <ArrowUpRight size={13} aria-hidden="true" />
      </span>
    </div>
  </a>
);

const PracticeTile = () => {
  const t = useTranslations('home');
  const items = t.raw('practice') as Card[];
  return (
    <section className={`${tile} p-6 md:p-7 flex flex-col`}>
      <Frame />
      <Eyebrow>{t('practiceLabel')}</Eyebrow>
      <ul className="relative space-y-5 flex-1">
        {items.map((c) => (
          <li key={c.title}>
            <h3 className="font-semibold text-light-text dark:text-zinc-100">{c.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{c.text}</p>
          </li>
        ))}
      </ul>
      <Link href="/services" className={`${link} relative mt-6`}>
        {t('allServices')} <ArrowRight size={12} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </section>
  );
};

const OwnTile = () => {
  const t = useTranslations('home');
  const items = t.raw('own') as Card[];
  return (
    <section className={`${tile} p-6 md:p-7`}>
      <Frame />
      <Eyebrow>{t('ownLabel')}</Eyebrow>
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((c, i) => (
          <div key={c.title} className={`${inner} p-5`}>
            <div className="flex justify-between"><Tick /><span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">{String(i + 1).padStart(2, '0')}</span></div>
            <h3 className="font-semibold text-light-text dark:text-zinc-100">{c.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const RolesTile = () => {
  const t = useTranslations('home');
  const roles = t.raw('roles') as Role[];
  return (
    <section className={`${tile} p-6 md:p-7 flex flex-col`}>
      <Frame />
      <Eyebrow>{t('rolesLabel')}</Eyebrow>
      <ol className="relative flex-1 border-l border-light-border dark:border-[#26262b] ml-1.5 space-y-5">
        {roles.map((r) => (
          <li key={r.org} className="relative pl-5">
            <span aria-hidden="true" className={`absolute -left-[6.5px] top-1.5 w-3 h-3 rounded-full ${r.current ? 'bg-emerald-500' : 'bg-white dark:bg-[#0c0c0e] border-[1.5px] border-zinc-400 dark:border-zinc-600'}`} />
            <p className="font-semibold text-sm text-light-text dark:text-zinc-100">{r.org}</p>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400">{r.role}</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              {r.current && <span className="text-emerald-700 dark:text-emerald-400">{t('current')} · </span>}{r.time}
            </p>
          </li>
        ))}
      </ol>
      <Link href="/about" className={`${link} relative mt-6`}>
        {t('experienceCta')} <ArrowRight size={12} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </section>
  );
};

const StatsTile = () => {
  const t = useTranslations('home');
  const stats = t.raw('stats') as Stat[];
  return (
    <section className={`${tile} p-6 md:p-7`} aria-label={t('statsLabel')}>
      <Frame />
      <Eyebrow>{t('statsLabel')}</Eyebrow>
      <dl className="relative grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`${inner} p-4 md:p-5`}>
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-mono font-bold tracking-tight text-3xl md:text-4xl text-brand-600 dark:text-brand-400">{s.value}</dd>
            <dd className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] leading-relaxed text-zinc-500 dark:text-zinc-400">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

const PipelineTile = () => {
  const t = useTranslations('home');
  const steps = t.raw('pipeline') as Step[];
  return (
    <section className={`${tile} p-6 md:p-7 flex flex-col`}>
      <Frame />
      <Eyebrow>{t('pipelineLabel')}</Eyebrow>
      <ol className="relative grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-0">
        {steps.map((s, i) => (
          <li key={s.title} className="flex">
            <div className={`${inner} flex-1 p-4 ${s.hot ? '!border-brand-500 ring-1 ring-brand-500/30' : ''}`}>
              <Tick />
              <p className="font-mono font-bold text-sm text-light-text dark:text-zinc-100">{s.title}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-zinc-600 dark:text-zinc-400">{s.text}</p>
            </div>
            {i < steps.length - 1 && <span aria-hidden="true" className="hidden md:flex items-center px-1.5 text-brand-500"><ArrowRight size={14} /></span>}
          </li>
        ))}
      </ol>
      <p className="relative mt-auto pt-5 text-sm text-zinc-500">{t('pipelineNote')}</p>
    </section>
  );
};

const StackTile = () => {
  const t = useTranslations('home');
  const rows = t.raw('stack') as StackRow[];
  return (
    <section className={`${tile} p-6 md:p-7`}>
      <Frame />
      <Eyebrow>{t('stackLabel')}</Eyebrow>
      <dl className="relative divide-y divide-light-border dark:divide-[#26262b]">
        {rows.map((r) => (
          <div key={r.area} className="py-3 first:pt-0 last:pb-0 grid grid-cols-[88px_1fr] gap-3 items-baseline">
            <dt className="font-semibold text-sm text-light-text dark:text-zinc-100">{r.area}</dt>
            <dd className="font-mono text-[11px] uppercase tracking-[0.12em] leading-relaxed text-emerald-700 dark:text-emerald-400">{r.items}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

const QuoteTile = () => {
  const t = useTranslations('home');
  return (
    <figure className={`${tile} p-7 md:p-8 flex flex-col justify-center`}>
      <Frame />
      <span aria-hidden="true" className="relative font-mono text-6xl leading-none text-brand-500">&ldquo;</span>
      <blockquote className="relative mt-2 text-2xl md:text-[28px] leading-tight font-semibold tracking-tight text-light-text dark:text-zinc-100">{t('quote')}</blockquote>
      <figcaption className="relative mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">— {t('quoteBy')}</figcaption>
    </figure>
  );
};

const ContactTile = () => {
  const t = useTranslations('home');
  return (
    <section className={`${tile} min-h-[300px] !bg-[#08080a] flex flex-col justify-end`}>
      <div aria-hidden="true" className="absolute inset-0 bg-[url('/art/v2/site-contact.webp')] bg-cover bg-[position:70%_50%]" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/80 to-[#0a0a0b]/10" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-[3px] bg-brand-500/85" />
      <div className="relative p-6 md:p-7">
        <h2 className="font-mono font-bold tracking-tight text-2xl text-zinc-100">{t('contactTitle')}</h2>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{t('contactText')}</p>
        <Button to="/contact" track="home:contact-tile" className="mt-6 !bg-white !text-black hover:!bg-zinc-200">{t('contactCta')}</Button>
      </div>
    </section>
  );
};

const SynthwerkBand = ({ f }: { f: Flagship }) => (
  <a href={f.href} target="_blank" rel="noopener noreferrer" className={`${tile} group block min-h-[280px] !bg-[#0a0a0b] hover:border-brand-500/50 transition-colors`}>
    <div aria-hidden="true" className="absolute inset-0 bg-[url('/art/v2/synthwerk.webp')] bg-cover bg-center group-hover:scale-[1.02] transition-transform duration-700" />
    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,10,11,0.96),rgba(10,10,11,0.8)_35%,rgba(10,10,11,0.05)_75%)]" />
    <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-[3px] bg-brand-500/85" />
    <div className="relative p-7 md:p-12 max-w-lg">
      <Pill>{f.status}</Pill>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">VM. / Flagship</p>
      <h2 className="mt-2 font-mono font-bold tracking-tighter text-4xl md:text-6xl text-white">{f.name}</h2>
      <div className="mt-4 flex items-center gap-4">
        <span aria-hidden="true" className="w-11 h-0.5 bg-brand-500" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">{f.label}</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-zinc-400">{f.text}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-100 group-hover:text-brand-400 transition-colors">
        {f.cta} <ArrowUpRight size={13} aria-hidden="true" />
      </span>
    </div>
  </a>
);

export default function HomeContent() {
  const t = useTranslations('home');
  const flagships = t.raw('flagships') as Flagship[];
  const byKey = (k: string) => flagships.find((f) => f.key === k) as Flagship;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto relative">
      <BrandAurora />
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-min">
        <AnimateIn from="left" className="md:col-span-6 lg:col-span-8"><Hero /></AnimateIn>
        <AnimateIn from="right" delay={100} className="md:col-span-6 lg:col-span-4"><CodeContextCard f={byKey('code-context-mcp')} /></AnimateIn>

        <AnimateIn from="bottom-left" delay={100} className="md:col-span-3 lg:col-span-4"><PracticeTile /></AnimateIn>
        <AnimateIn from="bottom" delay={150} className="md:col-span-6 lg:col-span-5 md:order-last lg:order-none"><OwnTile /></AnimateIn>
        <AnimateIn from="bottom-right" delay={200} className="md:col-span-3 lg:col-span-3"><RolesTile /></AnimateIn>

        <AnimateIn from="bottom-left" delay={100} className="md:col-span-6 lg:col-span-4"><StatsTile /></AnimateIn>
        <AnimateIn from="bottom-right" delay={150} className="md:col-span-6 lg:col-span-8"><PipelineTile /></AnimateIn>

        <AnimateIn from="bottom-left" delay={100} className="md:col-span-6 lg:col-span-5"><StackTile /></AnimateIn>
        <AnimateIn from="bottom" delay={150} className="md:col-span-3 lg:col-span-3"><QuoteTile /></AnimateIn>
        <AnimateIn from="bottom-right" delay={200} className="md:col-span-3 lg:col-span-4"><ContactTile /></AnimateIn>

        <AnimateIn from="bottom" delay={100} className="md:col-span-6 lg:col-span-12"><SynthwerkBand f={byKey('synthwerk')} /></AnimateIn>
      </div>
    </div>
  );
}
