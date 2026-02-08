import React from 'react';
import { notFound } from 'next/navigation';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { BentoCard } from '@/components/molecules/BentoCard';
import { Button } from '@/components/atoms/Button';
import { Check, Zap, Layers, GitBranch, Laptop, Box, type LucideIcon } from 'lucide-react';

type ServiceId = 'requirements-engineering' | 'ux-ui-branding' | 'frontend-development' | 'project-delivery' | 'modern-stack';

interface ServiceData {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  description: string;
  problems: string[];
  process: { title: string; desc: string }[];
  tech: string[];
  cta: string;
}

const serviceData: Record<ServiceId, ServiceData> = {
  'requirements-engineering': {
    title: "Requirements Engineering",
    subtitle: "Business verstehen",
    icon: Laptop,
    description: "Gutes Frontend beginnt nicht beim Code, sondern beim Verstehen des Business. Ich erfasse Stakeholder-Anforderungen, analysiere Geschäftsprozesse und übersetze sie in klar definierte, umsetzbare Spezifikationen.",
    problems: [
      "Unklare oder widersprüchliche Anforderungen von Stakeholdern",
      "Features werden gebaut, aber lösen das eigentliche Problem nicht",
      "Fehlende Dokumentation führt zu Scope Creep",
      "Kommunikationslücken zwischen Business und Entwicklung"
    ],
    process: [
      { title: "Stakeholder Interviews", desc: "Strukturierte Gespräche zur Erfassung der Business-Ziele." },
      { title: "Anforderungsanalyse", desc: "User Stories, Acceptance Criteria und Priorisierung." },
      { title: "Machbarkeitscheck", desc: "Technische Bewertung und Aufwandsschätzung." },
      { title: "Spezifikation", desc: "Dokumentierte Requirements als Grundlage für Design und Entwicklung." }
    ],
    tech: ["User Stories", "Stakeholder Mapping", "Figma", "Notion", "Claude AI"],
    cta: "Anforderungsanalyse starten"
  },
  'ux-ui-branding': {
    title: "UX/UI & Branding",
    subtitle: "Design als Markenbotschaft",
    icon: Layers,
    description: "UX/UI-Design ist mehr als hübsche Screens – es ist ein integraler Teil der Markenidentität. Ich übersetze Business-Anforderungen in visuelle Konzepte, die zur Brand passen und Nutzer überzeugen.",
    problems: [
      "Inkonsistente Markenwahrnehmung über digitale Touchpoints",
      "Design ohne Verständnis für die zugrundeliegenden Business-Ziele",
      "Disconnect zwischen Brand Identity und User Interface",
      "Fehlende Design-Systematik für skalierbare Produkte"
    ],
    process: [
      { title: "Brand Analysis", desc: "Markenidentität verstehen und in Design-Prinzipien übersetzen." },
      { title: "UX Konzeption", desc: "Wireframes und User Flows basierend auf den Requirements." },
      { title: "UI Design", desc: "High-Fidelity Designs in Figma, konsistent mit der Brand." },
      { title: "Design System", desc: "Skalierbare Komponentenbibliothek als Single Source of Truth." }
    ],
    tech: ["Figma", "Design Tokens", "Tailwind CSS", "Radix UI", "Storybook"],
    cta: "UX/UI Projekt besprechen"
  },
  'frontend-development': {
    title: "Frontend Development",
    subtitle: "Modern Stack",
    icon: Box,
    description: "Die technische Umsetzung mit Next.js, React und TypeScript. Ich baue performante, SEO-freundliche und wartbare Frontends – basierend auf den zuvor erarbeiteten Requirements und UX/UI-Konzepten.",
    problems: [
      "Veraltete Technologien und fehlende Skalierbarkeit",
      "Performance-Probleme durch große Bundles",
      "Keine klare Architektur für wachsende Projekte",
      "Mangelnde Testabdeckung und Code-Qualität"
    ],
    process: [
      { title: "Architecture Setup", desc: "Next.js App Router, Komponentenstruktur und Best Practices." },
      { title: "Component Development", desc: "Atomic Design Pattern mit TypeScript und Tailwind." },
      { title: "Supabase Integration", desc: "Backend-Anbindung mit Supabase für Auth, DB und Storage." },
      { title: "Testing & QA", desc: "Automatisierte Tests mit Jest, Playwright und CI/CD." }
    ],
    tech: ["Next.js", "React", "TypeScript", "Supabase", "Tailwind CSS"],
    cta: "Entwicklung starten"
  },
  'project-delivery': {
    title: "Projektplanung & Delivery",
    subtitle: "Start to Deployment",
    icon: GitBranch,
    description: "Ich plane und begleite Projekte ganzheitlich – von der ersten Idee über die Entwicklung bis zum Go-Live. Mit klarer Struktur, realistischen Meilensteinen und modernen Deployment-Strategien.",
    problems: [
      "Projekte ohne klaren Plan verzögern sich ständig",
      "Kein definierter Prozess von Anforderung bis Deployment",
      "Fehlende CI/CD-Pipeline für automatisierte Releases",
      "Kein Monitoring nach dem Launch"
    ],
    process: [
      { title: "Projektplanung", desc: "Scope, Meilensteine und Tech-Stack-Entscheidung." },
      { title: "Sprint-Struktur", desc: "Iterative Entwicklung mit klaren Deliverables." },
      { title: "CI/CD Setup", desc: "GitHub Actions, automatisierte Tests und Preview Deployments." },
      { title: "Go-Live & Monitoring", desc: "Vercel Deployment, Performance-Monitoring und Iteration." }
    ],
    tech: ["GitHub Actions", "Vercel", "CI/CD", "Playwright", "Analytics"],
    cta: "Projekt planen"
  },
  'modern-stack': {
    title: "Modern Stack",
    subtitle: "Supabase, Vercel & AI",
    icon: Zap,
    description: "Ich setze auf einen modernen, bewährten Stack: Next.js als Framework, Supabase als Backend, Vercel als Platform und Claude AI als Produktivitätswerkzeug. Alles verbunden durch CI/CD-Pipelines.",
    problems: [
      "Veraltete Infrastruktur mit hohem Wartungsaufwand",
      "Kein automatisiertes Deployment und Testing",
      "Fehlende Backend-Lösung für schnelle Prototypen",
      "Manuelle, repetitive Entwicklungsarbeit ohne AI-Unterstützung"
    ],
    process: [
      { title: "Stack Assessment", desc: "Bewertung der aktuellen Tools und Migrationsmöglichkeiten." },
      { title: "Supabase Setup", desc: "Auth, Datenbank, Storage und Realtime-Funktionen." },
      { title: "Vercel Deployment", desc: "Preview Deployments, Edge Functions und Analytics." },
      { title: "AI Integration", desc: "Claude AI für Code-Reviews, Testing und Dokumentation." }
    ],
    tech: ["Next.js", "Supabase", "Vercel", "Claude AI", "GitHub Actions"],
    cta: "Stack-Beratung anfragen"
  }
};

const validServiceIds: ServiceId[] = ['requirements-engineering', 'ux-ui-branding', 'frontend-development', 'project-delivery', 'modern-stack'];

export function generateStaticParams() {
  return validServiceIds.map((serviceId) => ({
    serviceId,
  }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  if (!validServiceIds.includes(serviceId as ServiceId)) {
    notFound();
  }

  const content = serviceData[serviceId as ServiceId];
  const Icon = content.icon;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <SectionHeader title={content.title} subtitle={content.subtitle} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-8 space-y-6">
          <BentoCard className="bg-white dark:bg-[#111] min-h-[300px]">
             <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 text-black dark:text-white">
                   <Icon size={32} />
                </div>
                <div>
                   <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-4">{content.title}</h2>
                   <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-2xl">
                      {content.description}
                   </p>
                </div>
             </div>
          </BentoCard>

          <div className="grid md:grid-cols-2 gap-6">
             <BentoCard className="bg-gray-50 dark:bg-[#0A0A0A]" title="Herausforderungen">
                <ul className="space-y-3 mt-4">
                   {content.problems.map((prob: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                         <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                         {prob}
                      </li>
                   ))}
                </ul>
             </BentoCard>

             <BentoCard className="bg-gray-50 dark:bg-[#0A0A0A]" title="Lösungsansatz">
                <ul className="space-y-4 mt-4">
                   {content.process.map((step, i: number) => (
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
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <BentoCard className="bg-[#E5E5E5] dark:bg-[#E2E2E2] !text-black" title="Tech Stack">
              <div className="flex flex-wrap gap-2 mt-4">
                 {content.tech.map((t: string) => (
                    <span key={t} className="px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-mono font-bold">
                       {t}
                    </span>
                 ))}
              </div>
           </BentoCard>

           <BentoCard className="bg-blue-50 dark:bg-blue-900/10 border-blue-500/20">
              <h3 className="text-xl font-bold text-blue-900 dark:text-white mb-2">Interesse geweckt?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                 Lassen Sie uns unverbindlich darüber sprechen, wie ich Ihr Product Team verstärken kann.
              </p>
              <Button to="/contact" className="w-full">
                 {content.cta}
              </Button>
           </BentoCard>
        </div>

      </div>
    </div>
  );
}
