'use client';

import { useState } from 'react';
import { deleteMessage } from '../actions';

/** Two-step delete: the first click only arms the real submit button. */
export function DeleteButton({ id }: { id: string }) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-500"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={deleteMessage} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-sm">Delete for good?</span>
      <button type="submit" className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
        Yes, delete
      </button>
      <button type="button" onClick={() => setArmed(false)} className="px-2 py-2 text-sm">
        Cancel
      </button>
    </form>
  );
}
