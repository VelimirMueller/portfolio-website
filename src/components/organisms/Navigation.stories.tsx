import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Navigation } from './Navigation';

const meta = {
  title: 'Organisms/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/',
      },
    },
    docs: {
      description: {
        component:
          'Fixed navigation bar with desktop dropdown menu, mobile hamburger drawer, theme toggle (light/dark), and language toggle (DE/EN). Uses `usePathname` for active route highlighting.',
      },
    },
  },
  decorators: [
    function LayoutDecorator(Story) {
      return (
        <div style={{ minHeight: '400px', paddingTop: '120px' }}>
          <Story />
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-light-sub dark:text-dark-sub font-mono text-sm">
              Page content below the fixed navigation bar. Scroll down to see the
              nav backdrop blur in action.
            </p>
          </div>
        </div>
      );
    },
  ],
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnServicesPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/services',
      },
    },
    docs: {
      description: {
        story:
          'Navigation with `/services` as the active route — the Services link is highlighted.',
      },
    },
  },
};

export const OnAboutPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/about',
      },
    },
  },
};

export const OnProjectsPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/projects',
      },
    },
  },
};

export const MobileViewport: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile' },
    docs: {
      description: {
        story:
          'At mobile widths the desktop nav links hide and the hamburger icon appears. Click it to open the full-screen mobile menu with all sub-items.',
      },
    },
  },
};

export const TabletViewport: Story = {
  parameters: {
    viewport: { defaultViewport: 'tablet' },
  },
};
