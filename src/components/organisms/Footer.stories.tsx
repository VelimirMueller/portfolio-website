import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Footer } from './Footer';

const meta = {
  title: 'Organisms/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Multi-column footer with brand tagline, sitemap links (Services, Projects, About), social icons (LinkedIn, GitHub, Email), and legal links (Imprint, Privacy). Uses `useLanguage` for i18n.',
      },
    },
  },
  decorators: [
    function HeightDecorator(Story) {
      return (
        <div style={{ minHeight: '200px' }}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MobileViewport: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Footer at mobile width — columns stack vertically.',
      },
    },
  },
  globals: {
    viewport: { value: 'mobile', isRotated: false },
  },
};

export const TabletViewport: Story = {
  globals: {
    viewport: { value: 'tablet', isRotated: false },
  },
};
