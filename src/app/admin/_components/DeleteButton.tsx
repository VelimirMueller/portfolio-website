'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteMessage } from '../actions';
import { SubmitButton } from './SubmitButton';

/** Two-step delete: the first click only arms the real submit button. */
export function DeleteButton({ id }: { id: string }) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="flex items-center gap-3 w-full p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-left text-xs text-red-300 transition-colors"
      >
        <Trash2 size={14} aria-hidden="true" />
        Delete
      </button>
    );
  }

  return (
    <form action={deleteMessage} className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 animate-pulse-glow space-y-3">
      <input type="hidden" name="id" value={id} />
      <p className="text-xs text-red-300">Delete for good? This cannot be undone.</p>
      <div className="flex gap-2">
        <SubmitButton
          pendingLabel="Deleting…"
          className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Yes, delete
        </SubmitButton>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="flex-1 py-2 bg-[#1a1a1a] border border-[#333] text-white text-xs font-bold rounded-lg hover:bg-[#222]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
