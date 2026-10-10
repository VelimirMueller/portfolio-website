import { Mail } from 'lucide-react';
import { sendMagicLink } from '../actions';
import { SubmitButton } from '../_components/SubmitButton';

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      <div className="w-full max-w-sm bg-[#111111] rounded-[2rem] p-8 border border-[#222] animate-fade-in-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center font-bold text-white">
            V
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Velimir<span className="text-gray-600">Admin</span>
          </span>
        </div>

        {searchParams.sent ? (
          <div role="status" className="flex items-start gap-3 p-3 rounded-xl border border-brand-500/20 bg-brand-500/5">
            <Mail size={16} className="text-brand-400 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-gray-300 leading-relaxed">
              If that address may sign in, a login link is on its way. Open it in this browser.
            </p>
          </div>
        ) : (
          <form action={sendMagicLink} className="flex flex-col gap-3">
            {searchParams.error && (
              <p role="alert" className="text-xs text-red-300 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                That login link did not work. Request a new one.
              </p>
            )}
            <label htmlFor="email" className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
            />
            <SubmitButton
              pendingLabel="Sending…"
              className="mt-2 w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-900/20 transition-colors"
            >
              Send login link
            </SubmitButton>
          </form>
        )}
      </div>
    </main>
  );
}
