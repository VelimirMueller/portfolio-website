import { sendMagicLink } from '../actions';

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string };
}) {
  return (
    <section className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 font-mono text-xl font-bold">Admin</h1>

      {searchParams.sent ? (
        <p role="status" className="text-sm text-light-sub dark:text-dark-sub">
          If that address may sign in, a login link is on its way. Open it in this browser.
        </p>
      ) : (
        <form action={sendMagicLink} className="flex flex-col gap-3">
          {searchParams.error && (
            <p role="alert" className="text-sm text-red-500">
              That login link did not work. Request a new one.
            </p>
          )}
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-lg border border-light-border bg-light-card px-3 py-2 dark:border-dark-border dark:bg-dark-card"
          />
          <button
            type="submit"
            className="rounded-full bg-black px-6 py-3 font-mono text-sm font-bold text-white dark:bg-white dark:text-black"
          >
            Send login link
          </button>
        </form>
      )}
    </section>
  );
}
