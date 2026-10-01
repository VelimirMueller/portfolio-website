'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

/**
 * Disables itself while its form's server action runs, so a slow request
 * (e.g. the magic-link mail over SMTP) cannot be fired twice by a second click.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className = '',
}: {
  children: ReactNode;
  pendingLabel: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`${className} disabled:opacity-60 disabled:cursor-wait`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
