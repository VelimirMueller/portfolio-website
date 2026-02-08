CLAUDE.md - Next.js Development Specification
Core Principle
CRITICAL: All changes must preserve existing app behavior. The app must work exactly as before.
Project Setup
Technology Stack

Framework: Next.js (App Router)
Database: Supabase
Deployment: Vercel
Testing: Jest + React Testing Library + Playwright
Styling: (Use existing styling approach)

Environment Configuration
Create .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://zkvpvhrmrbkpuspypqrj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_F-mjXO72s6zvuM0WZ1yaow_xrp_bl51
Supabase Integration
Server Client (/utils/supabase/server.ts)
typescriptimport { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
return createServerClient(
supabaseUrl!,
supabaseKey!,
{
cookies: {
getAll() {
return cookieStore.getAll()
},
setAll(cookiesToSet) {
try {
cookiesToSet.forEach(({ name, value, options }) =>
cookieStore.set(name, value, options)
)
} catch {
// The `setAll` method was called from a Server Component.
// This can be ignored if you have middleware refreshing user sessions.
}
},
},
},
);
};
Usage in Server Components
typescriptimport { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
const cookieStore = await cookies()
const supabase = createClient(cookieStore)
const { data: todos } = await supabase.from('todos').select()

return (
<ul>
{todos?.map((todo) => (
<li key={todo.id}>{todo}</li>
))}
</ul>
)
}
Architecture Patterns
Atomic Design Structure
src/
├── components/
│   ├── atoms/           # Basic building blocks
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Label/
│   │   ├── Icon/
│   │   └── Typography/
│   ├── molecules/       # Simple combinations
│   │   ├── SearchBar/
│   │   ├── FormField/
│   │   └── Card/
│   ├── organisms/       # Complex components
│   │   ├── NavigationBar/
│   │   ├── ProductCard/
│   │   └── LoginForm/
│   ├── templates/       # Page layouts
│   └── pages/          # Specific instances
├── containers/         # Smart components
├── utils/
├── hooks/
└── types/
Component Classification
Presentational (Dumb) Components
Location: components/atoms, components/molecules, components/organisms
Characteristics:

Receive data via props only
No state management (except UI state like hover, focus)
No side effects or API calls
Highly reusable
Easy to test
Pure functions of their props

Example:
typescript// components/atoms/Button/Button.tsx
interface ButtonProps {
children: React.ReactNode;
onClick?: () => void;
variant?: 'primary' | 'secondary';
disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
children,
onClick,
variant = 'primary',
disabled = false
}) => {
return (
<button
onClick={onClick}
disabled={disabled}
className={`button button--${variant}`}
>
{children}
</button>
);
};
Container (Smart) Components
Location: containers/
Characteristics:

Manage state (local or global)
Handle side effects (data fetching, subscriptions)
Connect to APIs or state management
Pass data to presentational components
Contain business logic

Example:
typescript// containers/TodoListContainer.tsx
'use client'

import { useEffect, useState } from 'react';
import { TodoList } from '@/components/organisms/TodoList';
import { createClient } from '@/utils/supabase/client';

export const TodoListContainer = () => {
const [todos, setTodos] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
const fetchTodos = async () => {
const supabase = createClient();
const { data } = await supabase.from('todos').select();
setTodos(data || []);
setLoading(false);
};

    fetchTodos();
}, []);

return <TodoList todos={todos} loading={loading} />;
};
Testing Strategy
Test Distribution (Recommended)

70% Unit Tests: Test individual components and functions
20% Integration Tests: Test component interactions
10% E2E Tests: Test complete user flows

Unit Tests
Framework: Jest + React Testing Library
What to test:

Individual atoms, molecules, organisms
Utility functions
Custom hooks
Props rendering
User interactions
Edge cases

Example:
typescript// components/atoms/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
it('renders children correctly', () => {
render(<Button>Click me</Button>);
expect(screen.getByText('Click me')).toBeInTheDocument();
});

it('calls onClick when clicked', () => {
const handleClick = jest.fn();
render(<Button onClick={handleClick}>Click me</Button>);
fireEvent.click(screen.getByText('Click me'));
expect(handleClick).toHaveBeenCalledTimes(1);
});

it('is disabled when disabled prop is true', () => {
render(<Button disabled>Click me</Button>);
expect(screen.getByText('Click me')).toBeDisabled();
});
});
Integration Tests
Framework: Jest + React Testing Library
What to test:

Interaction between smart and dumb components
Data flow between components
Form submissions
API mocking

Example:
typescript// containers/TodoListContainer.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { TodoListContainer } from './TodoListContainer';

jest.mock('@/utils/supabase/client', () => ({
createClient: () => ({
from: () => ({
select: jest.fn().mockResolvedValue({
data: [{ id: 1, title: 'Test Todo' }]
})
})
})
}));

describe('TodoListContainer', () => {
it('fetches and displays todos', async () => {
render(<TodoListContainer />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });
});
});
E2E Tests
Framework: Playwright
What to test:

Critical user journeys
Authentication flows
Complete features end-to-end

Example:
typescript// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
await page.goto('/login');
await page.fill('input[name="email"]', 'user@example.com');
await page.fill('input[name="password"]', 'password123');
await page.click('button[type="submit"]');
await expect(page).toHaveURL('/dashboard');
});
Visual Regression Testing
Framework: Playwright + Percy or Chromatic
Setup:
typescript// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
use: {
screenshot: 'only-on-failure',
},
});
Example:
typescripttest('button looks correct', async ({ page }) => {
await page.goto('/components/button');
await expect(page).toHaveScreenshot('button-default.png');
});
File Structure Standards
Component Structure
Component/
├── Component.tsx           # Main component
├── Component.test.tsx      # Unit tests
├── Component.stories.tsx   # Storybook (optional)
├── Component.module.css    # Styles (if using CSS modules)
├── index.ts               # Export barrel
└── types.ts               # TypeScript types
Container Structure
ContainerName/
├── ContainerName.tsx
├── ContainerName.test.tsx
├── useContainerName.ts    # Custom hook (if complex logic)
└── index.ts
Development Guidelines
1. Preserve Existing Behavior

Never break existing functionality
All existing features must work identically
Test thoroughly after any refactoring

2. Component Development

Start with atoms, build up to organisms
Keep components small and focused
Use TypeScript for type safety
Write tests alongside components

3. State Management

Use React hooks for local state
Consider Context API for shared state
Keep state as close to where it's used as possible
Server components for data fetching when possible

4. Supabase Best Practices

Use server components for initial data fetching
Use client components for real-time subscriptions
Handle errors gracefully
Implement proper loading states

5. Testing Best Practices

Write tests before or alongside code
Test behavior, not implementation
Mock external dependencies
Maintain high code coverage (aim for >80%)

6. Code Quality

Use ESLint and Prettier
Follow consistent naming conventions
Document complex logic
Keep functions pure when possible

Deployment
Vercel Deployment

Connect GitHub repository to Vercel
Add environment variables in Vercel dashboard
Configure build settings:

Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next



Environment Variables (Vercel)
Add in Vercel dashboard:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
Migration Strategy
When refactoring existing code:

Identify current components and their behavior
Document all existing functionality
Create tests for current behavior
Refactor to atomic design pattern
Verify all tests still pass
Confirm app works identically

Success Criteria
✅ App functions exactly as before
✅ All existing features work
✅ Test coverage >80%
✅ Components follow atomic design
✅ Clear separation between smart/dumb components
✅ Supabase integration working
✅ Successfully deployed to Vercel
Notes

Always prioritize working functionality over perfect architecture
Refactor incrementally, not all at once
Keep user experience unchanged
Document any deviations from this spec with clear reasoning