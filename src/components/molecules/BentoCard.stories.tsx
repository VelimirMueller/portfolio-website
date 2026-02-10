import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Code2, Palette, Rocket, Settings, Zap } from 'lucide-react';
import { BentoCard } from './BentoCard';

const meta = {
  title: 'Molecules/BentoCard',
  component: BentoCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Bento grid card with hover translate effect, optional icon with scale animation, title, and subtitle. Uses `.bento-card` CSS class for the glow hover effect.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    noPadding: { control: 'boolean' },
    className: { control: 'text' },
    icon: {
      control: 'select',
      options: ['Code2', 'Palette', 'Rocket', 'Settings', 'Zap', 'none'],
      mapping: { Code2, Palette, Rocket, Settings, Zap, none: undefined },
    },
  },
  decorators: [
    function WidthDecorator(Story) {
      return (
        <div style={{ width: '400px' }}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof BentoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <p className="text-light-sub dark:text-dark-sub text-sm">
        Card content goes here.
      </p>
    ),
  },
};

export const WithTitleAndSubtitle: Story = {
  args: {
    title: 'Frontend Development',
    subtitle: 'Services',
    icon: Code2,
    children: (
      <p className="text-light-sub dark:text-dark-sub text-sm">
        Building modern web applications with Next.js, React, and TypeScript.
      </p>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Modern Stack',
    subtitle: 'Technology',
    icon: Rocket,
    children: (
      <p className="text-light-sub dark:text-dark-sub text-sm">
        Next.js, Supabase, Vercel, Tailwind CSS.
      </p>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    noPadding: true,
    children: (
      <div className="bg-gradient-to-br from-brand-500/20 to-transparent h-48 flex items-center justify-center">
        <span className="text-brand-500 font-mono text-sm">
          Full-bleed content
        </span>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'With `noPadding` enabled, content fills the card edge-to-edge — useful for images or gradient backgrounds.',
      },
    },
  },
};

export const MinimalContent: Story = {
  args: {
    children: (
      <p className="text-light-sub dark:text-dark-sub text-sm">
        A simple card with no header.
      </p>
    ),
  },
};

export const CustomClassName: Story = {
  args: {
    title: 'Spanning Card',
    subtitle: 'Layout',
    icon: Settings,
    className: 'bg-zinc-100 dark:bg-zinc-900 border-none',
    children: (
      <p className="text-light-sub dark:text-dark-sub text-sm">
        This card uses a custom className for alternative styling.
      </p>
    ),
  },
  decorators: [
    function WideDecorator(Story) {
      return (
        <div style={{ width: '600px' }}>
          <Story />
        </div>
      );
    },
  ],
};
