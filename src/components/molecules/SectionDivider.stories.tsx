import type { Meta, StoryObj } from '@storybook/react';
import { SectionDivider } from './SectionDivider';

const meta = {
  title: 'Molecules/SectionDivider',
  component: SectionDivider,
  parameters: { layout: 'padded', docs: { description: { component: 'Numbered art divider (vm-brand signature mark NN / TITLE). Always on the dark plate.' } } },
} satisfies Meta<typeof SectionDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { index: '01', total: 5, title: 'Practice', caption: 'Three areas, one owner', countLabel: 'Section', strip: 1, className: '' },
};
