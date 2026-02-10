import type { Meta, StoryObj } from '@storybook/react';
import { LanguageToggle } from './LanguageToggle';

const meta = {
  title: 'Atoms/LanguageToggle',
  component: LanguageToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Circular toggle button that switches between German (DE) and English (EN). Reads from `LanguageProvider` context — clicking the button toggles the active language. Shows the language to switch *to* (e.g. "EN" when current language is German).',
      },
    },
  },
} satisfies Meta<typeof LanguageToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnDarkBackground: Story = {
  decorators: [
    function DarkBgDecorator(Story) {
      return (
        <div className="bg-dark-bg p-8 rounded-xl">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Toggle rendered on a dark surface to verify contrast.',
      },
    },
  },
};
