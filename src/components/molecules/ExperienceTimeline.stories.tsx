import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ExperienceTimeline } from './ExperienceTimeline';
import { GlassPanel } from './GlassPanel';
import { SectionStage } from './SectionStage';
import { Eyebrow } from '../atoms/Signature';

const meta = {
  title: 'Molecules/ExperienceTimeline',
  component: ExperienceTimeline,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Experience log timeline in the glass look. Desktop: centre line, entries alternate sides. Mobile: line left, cards right. The first entry is the current role.',
      },
    },
  },
  args: {
    currentLabel: 'Current',
    entries: [
      { id: 'exp1', title: 'Senior Software Engineer', tag: 'Startup', company: 'ACME', date: 'Feb 2025 - Present', desc: 'Owns product engineering end to end, from requirements to cloud deployment.' },
      { id: 'exp2', title: 'Software Engineer', tag: 'Agency', company: 'Initech', date: 'Mar 2022 - Jan 2025', desc: 'Builds client web apps with Vue, Nuxt and Laravel.' },
      { id: 'exp3', title: 'Frontend Developer', tag: 'Corporate', company: 'Globex', date: 'Jun 2021 - Feb 2022', desc: 'Builds a design system and the customer portal.' },
    ],
  },
  render: (args) => (
    <div className="relative overflow-x-clip py-16">
      <SectionStage art="site-svc-delivery" side="left">
        <GlassPanel className="p-6 md:p-10">
          <Eyebrow>Experience Log</Eyebrow>
          <ExperienceTimeline {...args} className="mt-2" />
        </GlassPanel>
      </SectionStage>
    </div>
  ),
} satisfies Meta<typeof ExperienceTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnStage: Story = {};

export const MobileViewport: Story = {
  globals: {
    viewport: { value: 'mobile', isRotated: false },
  },
};
