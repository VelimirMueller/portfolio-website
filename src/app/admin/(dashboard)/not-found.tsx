import Link from 'next/link';

// Shown inside the admin frame when a dashboard page calls notFound() (e.g. an
// unknown deck). The admin root layout has its own <html>, so without this
// Next falls back to its built-in page, which clashes with that layout.
export default function AdminNotFound() {
  return (
    <div className="py-16 text-center space-y-3">
      <h1 className="text-2xl font-bold text-white">Not found</h1>
      <p className="text-sm text-gray-500">This page does not exist (anymore).</p>
      <Link href="/admin" className="inline-block text-sm text-blue-400 hover:text-blue-300">
        Back to the inbox
      </Link>
    </div>
  );
}
