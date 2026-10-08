/** Shown when a Magic page cannot read its data. */
export function LoadError({ what }: { what: string }) {
  return (
    <p role="alert" className="text-sm text-red-400">
      Could not load {what}.
    </p>
  );
}
