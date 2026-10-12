import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GlassPanel, glassCard } from './GlassPanel';
import { SectionStage } from './SectionStage';
import { Eyebrow } from '../atoms/Signature';

const meta = {
  title: 'Molecules/GlassPanel',
  component: GlassPanel,
  parameters: { layout: 'padded', docs: { description: { component: 'Liquid-glass panel (vm-brand B-48) on a SectionStage. Glass only reads as glass over art.' } } },
} satisfies Meta<typeof GlassPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnStage: Story = {
  args: { children: null },
  render: () => (
    <div className="relative overflow-x-clip py-16">
      <SectionStage art="site-svc-delivery" side="right">
        <GlassPanel className="p-10">
          <Eyebrow>At a glance</Eyebrow>
          <div className="relative grid grid-cols-2 gap-4">
            {[['3–4×', 'Faster lead assignment'], ['81', 'Tools in code-context-mcp']].map(([v, l]) => (
              <div key={l} className={`${glassCard} p-6`}>
                <div className="font-mono font-bold text-4xl text-brand-600 dark:text-brand-400">{v}</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">{l}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </SectionStage>
    </div>
  ),
};
