import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Versatile button component that renders as a `<button>`, Next.js `<Link>`, or external `<a>` depending on props. Supports four visual variants with full dark mode support.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Visual style variant',
    },
    children: { control: 'text' },
    to: { control: 'text', description: 'URL — renders as Link (internal) or anchor (external)' },
    external: { control: 'boolean' },
    disabled: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    onClick: { action: 'clicked' },
    className: { control: 'text' },
  },
  args: {
    children: 'Click Me',
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary Button' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline Button' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost Button' },
};

export const Disabled: Story = {
  args: { variant: 'primary', children: 'Disabled', disabled: true },
};

export const InternalLink: Story = {
  args: { children: 'Go to About', to: '/about' },
  parameters: {
    docs: {
      description: {
        story: 'Renders as a Next.js `<Link>` for client-side navigation.',
      },
    },
  },
};

export const ExternalLink: Story = {
  args: { children: 'Open GitHub', to: 'https://github.com', external: true },
  parameters: {
    docs: {
      description: {
        story:
          'Renders as an `<a>` with `target="_blank"` and `rel="noopener noreferrer"`.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="primary" disabled>
        Disabled
      </Button>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
