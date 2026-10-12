import React, { useContext, useMemo, type ReactNode } from 'react';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
// No `.js` here on purpose: the main.ts alias matches only the `.js`
// specifier, so this import resolves to the real Next.js module, not to
// this file.
import { RedirectBoundary as NextRedirectBoundary } from 'next/dist/client/components/redirect-boundary';

// Workaround for storybookjs/storybook#36720. Next.js 16.4 `useRouter()` reads
// `LayoutRouterContext.parentRenderTree.data.bfcacheId`. The App Router mock of
// @storybook/nextjs-vite 10.6 does not set `parentRenderTree`, so every story
// throws in RedirectBoundary. main.ts aliases Storybook's RedirectBoundary
// import to this file, which adds the missing field (bfcacheId 0 is the value
// Next.js uses when there is no layout). Remove this file and the alias when
// @storybook/nextjs-vite sets the field itself.
type LayoutRouterValue = React.ContextType<typeof LayoutRouterContext>;

export function RedirectBoundary({ children }: { children: ReactNode }) {
  const layout = useContext(LayoutRouterContext);
  // The cast is deliberate: the mock value is not a full LayoutRouterContext.
  // After a Next.js upgrade, check that `useRouter()` in
  // next/dist/client/components/navigation.js still reads only this field.
  const value = useMemo(
    () =>
      layout && !layout.parentRenderTree
        ? ({ ...layout, parentRenderTree: { data: { bfcacheId: 0 } } } as unknown as LayoutRouterValue)
        : layout,
    [layout],
  );
  return (
    <LayoutRouterContext.Provider value={value}>
      <NextRedirectBoundary>{children}</NextRedirectBoundary>
    </LayoutRouterContext.Provider>
  );
}
