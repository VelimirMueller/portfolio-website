import type { Meta, StoryObj } from '@storybook/react';
import { SectionHeader } from './SectionHeader';

const meta = {
  title: 'Molecules/SectionHeader',
  component: SectionHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Large section heading with decorative green line, monospace subtitle with "01" prefix, and bold title. Used at the top of every major page section.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'OFFER.',
    subtitle: 'End-to-End Engineering',
  },
};

export const Projects: Story = {
  args: {
    title: 'WORK.',
    subtitle: 'Real Impact',
  },
};

export const About: Story = {
  args: {
    title: 'PROFILE.',
    subtitle: 'Velimir Müller',
  },
};

export const LongTitle: Story = {
  args: {
    title: 'REQUIREMENTS ENGINEERING.',
    subtitle: 'Stakeholder Communication & Analysis',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how the header handles longer text content.',
      },
    },
  },
};
