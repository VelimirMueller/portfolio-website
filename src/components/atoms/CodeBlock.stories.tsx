import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './CodeBlock';

const meta = {
  title: 'Atoms/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Terminal-style code display with macOS traffic light dots and optional filename header. Uses `dangerouslySetInnerHTML` for syntax-highlighted HTML strings.',
      },
    },
  },
  argTypes: {
    code: { control: 'text' },
    fileName: { control: 'text' },
  },
  decorators: [
    function WidthDecorator(Story) {
      return (
        <div style={{ width: '480px' }}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    code: 'const greeting = "Hello, World!";\nconsole.log(greeting);',
  },
};

export const WithFileName: Story = {
  args: {
    code: 'export default function Home() {\n  return &lt;h1&gt;Hello&lt;/h1&gt;;\n}',
    fileName: 'page.tsx',
  },
};

export const MultilineCode: Story = {
  args: {
    code: `import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default supabase;`,
    fileName: 'utils/supabase/client.ts',
  },
};

export const HTMLContent: Story = {
  args: {
    code: '<span style="color:#6366f1">const</span> <span style="color:#f4f4f5">x</span> = <span style="color:#22c55e">42</span>;',
    fileName: 'syntax-highlighted.ts',
  },
  parameters: {
    docs: {
      description: {
        story:
          'HTML strings are rendered as markup via `dangerouslySetInnerHTML`, useful for pre-highlighted code.',
      },
    },
  },
};
