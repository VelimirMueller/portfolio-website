import React from 'react';
import { ArrowUpRight, Cpu, Check, BrainCircuit, Newspaper, ExternalLink } from 'lucide-react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { ExpandableProjectCard } from '@/components/molecules/ExpandableProjectCard';
import { BuildCard, type BuildGroup } from '@/components/molecules/BuildCard';
import { Eyebrow } from '@/components/atoms/Signature';
import { GlassPanel } from '@/components/molecules/GlassPanel';
import { SectionStage } from '@/components/molecules/SectionStage';
import { SectionDivider } from '@/components/molecules/SectionDivider';
import { useTranslations } from 'next-intl';

type StageCopy = { index: string; title: string; caption: string };

// Studio builds (vm-brand groups). Text lives in projects.builds.<key>.
const BUILDS: { key: string; group: BuildGroup; tags: string[]; href?: string; link?: 'github' | 'site' }[] = [
  { key: 'synthwerk', group: 'flagship', tags: ['FastAPI', 'Go', 'ONNX', 'Nuxt'], href: 'https://github.com/VelimirMueller/synthwerk', link: 'github' },
  { key: 'rig', group: 'ops', tags: ['Claude Code', 'MCP', 'DeepSeek', 'GLM', 'MLX'] },
  { key: 'bench', group: 'flagship', tags: ['TypeScript', 'SQLite', 'GitHub Pages'], href: 'https://velimirmueller.github.io/code-context-mcp/', link: 'site' },
  { key: 'mtg', group: 'lab', tags: ['Kotlin', 'Compose', 'ML Kit', 'Supabase'] },
  { key: 'debater', group: 'lab', tags: ['LangGraph', 'Python', 'Langfuse'], href: 'https://github.com/VelimirMueller/lab-debater', link: 'github' },
  { key: 'skills', group: 'lab', tags: ['Claude Code', 'Vue', 'React'], href: 'https://github.com/VelimirMueller/lab-claude-skills', link: 'github' },
];

export default function ProjectsContent() {
  const t = useTranslations();
  const saasChecks = t.raw('projects.saas.checks') as string[];
  const mlChecks = t.raw('projects.ml.checks') as string[];
  const bewerbermappeChecks = t.raw('projects.bewerbermappe.checks') as string[];
  const stage = (key: string) => t.raw(`projects.stages.${key}`) as StageCopy;
  const [demos, builds, work] = [stage('demos'), stage('builds'), stage('work')];
  const count = t('home.sectionCount');

  return (
    <div className="relative overflow-x-clip">
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <AnimateIn from="bottom">
        <SectionHeader title={t('projects.title')} subtitle={t('projects.subtitle')} artClassName="bg-[url('/art/projects-v1.webp')] bg-cover bg-position-[100%_50%] mask-[linear-gradient(to_right,transparent_30%,black_65%,black_85%,transparent),linear-gradient(to_bottom,black_55%,transparent)] mask-intersect -top-24 -bottom-8 hidden md:block" />
      </AnimateIn>

      {/* --- FEATURED DEMOS --- */}
      <SectionStage art="site-svc-frontend" side="right">
      <SectionDivider id="demos" index={demos.index} total={3} title={demos.title} caption={demos.caption} countLabel={count} strip={1} className="mb-6" />
      <GlassPanel className="p-4 pt-8 md:p-8 md:pt-12 space-y-4">
        <Eyebrow className="mb-4!">{t('projects.interactiveDemos')}</Eyebrow>

        <AnimateIn from="bottom" delay={100}>
          <ExpandableProjectCard
            challengeLabel={t('projects.challengeLabel')}
            solutionLabel={t('projects.solutionLabel')}
            title={t('projects.mcp.title')}
            category="Developer Tool"
            techStack={['Node.js', 'TypeScript', 'SQLite', 'MCP']}
            metricValue={t('projects.mcp.impact1Value')}
            metricLabel={t('projects.mcp.impact1Label')}
            challenge={t('projects.mcp.challenge')}
            solution={t('projects.mcp.solution')}
            impacts={[
              { value: t('projects.mcp.impact1Value'), label: t('projects.mcp.impact1Label') },
              { value: t('projects.mcp.impact2Value'), label: t('projects.mcp.impact2Label') },
              { value: t('projects.mcp.impact3Value'), label: t('projects.mcp.impact3Label') },
            ]}
            demoHref="/projects/mcp-demo"
            demoLabel={t('projects.mcp.viewDemo')}
            accentColor="emerald"
          />
        </AnimateIn>

        <AnimateIn from="bottom" delay={200}>
          <ExpandableProjectCard
            challengeLabel={t('projects.challengeLabel')}
            solutionLabel={t('projects.solutionLabel')}
            title={t('projects.dashboard.title')}
            category="UI Showcase"
            techStack={['React', 'TypeScript', 'CSS/SVG', 'Next.js']}
            metricValue={t('projects.dashboard.impact1Value')}
            metricLabel={t('projects.dashboard.impact1Label')}
            challenge={t('projects.dashboard.challenge')}
            solution={t('projects.dashboard.solution')}
            impacts={[
              { value: t('projects.dashboard.impact1Value'), label: t('projects.dashboard.impact1Label') },
              { value: t('projects.dashboard.impact2Value'), label: t('projects.dashboard.impact2Label') },
              { value: t('projects.dashboard.impact3Value'), label: t('projects.dashboard.impact3Label') },
            ]}
            demoHref="/projects/dashboard-demo"
            demoLabel={t('projects.dashboard.viewDemo')}
            accentColor="blue"
          />
        </AnimateIn>

        <AnimateIn from="bottom" delay={300}>
          <ExpandableProjectCard
            challengeLabel={t('projects.challengeLabel')}
            solutionLabel={t('projects.solutionLabel')}
            title={t('projects.arcade.title')}
            category="Game Dev"
            techStack={['Rust', 'Bevy', 'WebAssembly', 'Touch Controls']}
            metricValue={t('projects.arcade.impact1Value')}
            metricLabel={t('projects.arcade.impact1Label')}
            challenge={t('projects.arcade.challenge')}
            solution={t('projects.arcade.solution')}
            impacts={[
              { value: t('projects.arcade.impact1Value'), label: t('projects.arcade.impact1Label') },
              { value: t('projects.arcade.impact2Value'), label: t('projects.arcade.impact2Label') },
              { value: t('projects.arcade.impact3Value'), label: t('projects.arcade.impact3Label') },
            ]}
            demoHref="/projects/cyberpunk-arcade/index.html"
            demoLabel={t('projects.arcade.cta')}
            accentColor="orange"
          />
        </AnimateIn>
      </GlassPanel>
      </SectionStage>

      {/* --- STUDIO BUILDS --- */}
      <SectionStage art="site-svc-stack" side="left">
      <SectionDivider id="builds" index={builds.index} total={3} title={builds.title} caption={builds.caption} countLabel={count} strip={2} />
      <GlassPanel className="p-4 md:p-8">
        <Eyebrow>{t('projects.studioBuilds')}</Eyebrow>
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUILDS.map((b, i) => (
            <AnimateIn key={b.key} from="bottom" delay={100 + i * 50}>
              <BuildCard
                group={b.group}
                title={t(`projects.builds.${b.key}.title`)}
                desc={t(`projects.builds.${b.key}.desc`)}
                image={`/art/build-${b.key}-v1.webp`}
                tags={b.tags}
                href={b.href}
                linkLabel={b.link ? t(`projects.${b.link}`) : undefined}
                privateLabel={t('projects.private')}
              />
            </AnimateIn>
          ))}
        </div>
      </GlassPanel>
      </SectionStage>

      <SectionStage art="site-svc-delivery" side="right">
      <SectionDivider id="work" index={work.index} total={3} title={work.title} caption={work.caption} countLabel={count} strip={3} />
      <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
        <h3 className="sr-only">{t('projects.realWorldWork')}</h3>

        {/* Project 1: Enterprise Workflow */}
        <AnimateIn from="left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass rounded-3xl p-6 md:p-8 group transition-all duration-300 ease-out">
           <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                 <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono border border-purple-500/20 uppercase">End-to-End</span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono border border-blue-500/20 uppercase">Next.js / React</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">{t('projects.enterprise.title')}</h2>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {t('projects.enterprise.desc')}
                 </p>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {['Next.js', 'React', 'Supabase', 'Vercel', 'Figma'].map(tag => (
                      <span key={tag} className="text-[11px] font-mono text-gray-500 px-2.5 py-1 bg-black/5 dark:bg-white/5 rounded-md">{tag}</span>
                    ))}
                 </div>
              </div>
              <Button to="/contact" variant="outline" className="w-fit">{t('projects.enterprise.cta')}</Button>
           </div>

           <div className="lg:col-span-7 glass-inner rounded-xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                 <Cpu size={64} className="text-purple-900/20 dark:text-purple-900/40" />
              </div>

              <div className="grid grid-cols-2 gap-4 h-full content-center">
                 <div className="col-span-2 glass-inner p-6 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-4xl md:text-5xl font-mono font-black text-black dark:text-white tracking-tight">500%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1.5">{t('projects.enterprise.metric')}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                       <ArrowUpRight size={24} className="text-green-600 dark:text-green-500"/>
                    </div>
                 </div>
                 <div className="glass-inner p-4 rounded-xl">
                    <div className="text-xs font-mono text-gray-500 uppercase mb-2">Role</div>
                    <div className="text-black dark:text-white font-mono text-sm">{t('projects.enterprise.role')}</div>
                 </div>
                 <div className="glass-inner p-4 rounded-xl">
                    <div className="text-xs font-mono text-gray-500 uppercase mb-2">Focus</div>
                    <div className="text-black dark:text-white font-mono text-sm">{t('projects.enterprise.focus')}</div>
                 </div>
              </div>
           </div>
        </div>
        </AnimateIn>

        {/* Project 2: SaaS Platform */}
        <AnimateIn from="right">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass rounded-3xl p-6 md:p-8 group transition-all duration-300 ease-out">
           <div className="lg:col-span-5 flex flex-col justify-between order-2 lg:order-1">
              <div className="glass-inner rounded-xl p-6 h-full flex flex-col justify-center relative overflow-hidden">
                 <div className="space-y-4">
                    {saasChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <Check size={16} className="text-green-600 dark:text-green-500" />
                         <span className="text-sm text-gray-600 dark:text-gray-300">{check}</span>
                      </div>
                    ))}
                 </div>
                 <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="text-xs text-gray-500 mb-2">Key Tech</div>
                    <div className="flex gap-2">
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded-sm border border-green-500/20 dark:border-green-900/30">Next.js</span>
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded-sm border border-green-500/20 dark:border-green-900/30">Vue</span>
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded-sm border border-green-500/20 dark:border-green-900/30">Node.js</span>
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded-sm border border-green-500/20 dark:border-green-900/30">Laravel</span>
                       <span className="px-2 py-1 bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] rounded-sm border border-green-500/20 dark:border-green-900/30">Supabase</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-7 flex flex-col justify-between order-1 lg:order-2">
              <div>
                 <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-mono border border-orange-500/20 uppercase">Branding</span>
                    <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white text-[10px] font-mono border border-black/10 dark:border-white/20 uppercase">Full Process</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">{t('projects.saas.title')}</h2>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {t('projects.saas.desc')}
                 </p>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {['Next.js', 'Vue', 'Node.js', 'Laravel', 'Supabase', 'Tailwind', 'GitHub Actions', 'Vercel'].map(tag => (
                      <span key={tag} className="text-[11px] font-mono text-gray-500 px-2.5 py-1 bg-black/5 dark:bg-white/5 rounded-md">{tag}</span>
                    ))}
                 </div>
              </div>
              <Button to="/contact" variant="outline" className="w-fit">{t('projects.saas.cta')}</Button>
           </div>
        </div>
        </AnimateIn>

        {/* Project 3: ML Lead Matching */}
        <AnimateIn from="left" delay={100}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass rounded-3xl p-6 md:p-8 group transition-all duration-300 ease-out">
           <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                 <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-mono border border-teal-500/20 uppercase">Machine Learning</span>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono border border-amber-500/20 uppercase">Data Science</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">{t('projects.ml.title')}</h2>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {t('projects.ml.desc')}
                 </p>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {['Python', 'scikit-learn', 'pandas', 'PostgreSQL', 'FastAPI'].map(tag => (
                      <span key={tag} className="text-[11px] font-mono text-gray-500 px-2.5 py-1 bg-black/5 dark:bg-white/5 rounded-md">{tag}</span>
                    ))}
                 </div>
              </div>
              <Button to="/contact" variant="outline" className="w-fit">{t('projects.ml.cta')}</Button>
           </div>

           <div className="lg:col-span-7 glass-inner rounded-xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                 <BrainCircuit size={64} className="text-teal-900/20 dark:text-teal-900/40" />
              </div>

              <div className="grid grid-cols-2 gap-4 h-full content-center">
                 <div className="col-span-2 glass-inner p-6 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-4xl md:text-5xl font-mono font-black text-black dark:text-white tracking-tight">{t('projects.ml.metricValue')}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1.5">{t('projects.ml.metric')}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                       <ArrowUpRight size={24} className="text-teal-600 dark:text-teal-500"/>
                    </div>
                 </div>
                 <div className="col-span-2">
                    <div className="space-y-3">
                       {mlChecks.map((check, i) => (
                         <div key={i} className="flex items-center gap-3">
                            <Check size={16} className="text-teal-600 dark:text-teal-500 shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{check}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
        </AnimateIn>

        {/* Project 4: bewerbermappe.com */}
        <AnimateIn from="right" delay={200}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass rounded-3xl p-6 md:p-8 group transition-all duration-300 ease-out">
           <div className="lg:col-span-5 flex flex-col justify-between order-2 lg:order-1">
              <div className="glass-inner rounded-xl p-6 h-full flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-50">
                    <Newspaper size={48} className="text-rose-900/20 dark:text-rose-900/40" />
                 </div>
                 <div className="space-y-3 mb-6">
                    {bewerbermappeChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <Check size={16} className="text-rose-600 dark:text-rose-500 shrink-0" />
                         <span className="text-sm text-gray-600 dark:text-gray-300">{check}</span>
                      </div>
                    ))}
                 </div>
                 <div className="pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Key Tech</div>
                    <div className="flex flex-wrap gap-2">
                       {['WordPress', 'PHP', 'JavaScript', 'WooCommerce', 'Custom Theme'].map(tag => (
                         <span key={tag} className="px-2 py-1 bg-rose-500/10 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] rounded-sm border border-rose-500/20 dark:border-rose-900/30">{tag}</span>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-7 flex flex-col justify-between order-1 lg:order-2">
              <div>
                 <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-mono border border-rose-500/20 uppercase">Startup</span>
                    <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white text-[10px] font-mono border border-black/10 dark:border-white/20 uppercase">Featured in Press</span>
                 </div>
                 <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">{t('projects.bewerbermappe.title')}</h2>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {t('projects.bewerbermappe.desc')}
                 </p>
                 <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
                    <div className="glass-inner rounded-lg px-4 py-3 flex items-center gap-3">
                       <div className="text-3xl font-mono font-black text-black dark:text-white">{t('projects.bewerbermappe.metricValue')}</div>
                       <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('projects.bewerbermappe.metric')}</div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">BILD · Die Zeit · n-tv</div>
                 </div>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {['WordPress', 'PHP', 'WooCommerce', 'JavaScript', 'UX/UI'].map(tag => (
                      <span key={tag} className="text-[11px] font-mono text-gray-500 px-2.5 py-1 bg-black/5 dark:bg-white/5 rounded-md">{tag}</span>
                    ))}
                 </div>
              </div>
              <a href="https://bewerbermappe.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 border border-black/10 dark:border-white/10 rounded-lg text-sm font-medium text-black dark:text-white hover:border-black/30 dark:hover:border-white/30 transition-colors w-fit">
                 {t('projects.bewerbermappe.cta')} <ExternalLink size={14} />
              </a>
           </div>
        </div>
        </AnimateIn>

      </div>
      </SectionStage>
    </div>
    </div>
  );
}
