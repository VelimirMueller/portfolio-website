import Link from 'next/link';
import { signOut } from '../actions';

export function AdminHeader() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <Link href="/admin" className="font-mono text-xl font-bold">
        Inbox
      </Link>
      <form action={signOut}>
        <button type="submit" className="text-sm text-light-sub hover:underline dark:text-dark-sub">
          Sign out
        </button>
      </form>
    </header>
  );
}
