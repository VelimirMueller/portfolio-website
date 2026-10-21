'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { ImportDeckState } from '@/app/admin/(dashboard)/magic/actions';

const input =
  'w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-hidden focus:border-brand-500';

const EXAMPLE = `4 Goblin Guide
4 Krenko, Mob Boss (M13) 141

SIDEBOARD:
2 Smash to Smithereens`;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      {pending ? 'Importing…' : 'Import deck'}
    </button>
  );
}

/**
 * Paste a decklist (Moxfield, MTG Arena, "4 Opt" lines). The deck is created
 * only when every name resolves; otherwise the names to fix are listed and the
 * pasted text stays in the field.
 */
export function DeckImportForm({
  action,
}: {
  action: (prev: ImportDeckState, formData: FormData) => Promise<ImportDeckState>;
}) {
  const [state, formAction] = useFormState(action, { errors: [], unresolved: [] });
  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <label className="block text-xs text-gray-500">
        Name
        <input name="name" required maxLength={80} placeholder="Krenko Mob Boss" className={`${input} mt-1`} />
      </label>
      <label className="block text-xs text-gray-500">
        Summary (optional)
        <input name="summary" maxLength={500} className={`${input} mt-1`} />
      </label>
      <label className="block text-xs text-gray-500">
        Decklist
        <textarea
          name="list"
          required
          rows={16}
          maxLength={20000}
          placeholder={EXAMPLE}
          spellCheck={false}
          className={`${input} mt-1 font-mono`}
        />
      </label>
      <p className="text-xs text-gray-500">
        Moxfield: More → Export → copy the plain text. Sideboard after a &quot;SIDEBOARD:&quot; line. Names may be
        English or German.
      </p>

      {state.errors.length > 0 && (
        <ul role="alert" className="space-y-1 text-sm text-red-400">
          {state.errors.map((e, i) => (
            <li key={`${i}-${e}`}>{e}</li>
          ))}
        </ul>
      )}
      {state.unresolved.length > 0 && (
        <div role="alert" className="space-y-2 text-sm">
          <p className="text-amber-400">
            {state.unresolved.length} name{state.unresolved.length === 1 ? '' : 's'} did not match a card. Fix them
            in the list and import again. Nothing was created.
          </p>
          <ul className="space-y-1 text-gray-300">
            {state.unresolved.map((u, i) => (
              <li key={`${i}-${u.name}`}>
                <span className="font-mono">{u.name}</span>
                {u.candidates.length > 0 && <span className="text-gray-500"> — did you mean {u.candidates.join(', ')}?</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Submit />
    </form>
  );
}
