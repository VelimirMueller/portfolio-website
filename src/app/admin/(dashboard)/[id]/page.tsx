import { redirect } from 'next/navigation';

/** Old per-message URLs (pre split view) open in the inbox workspace. */
export default function LegacyMessagePage({ params }: { params: { id: string } }) {
  redirect(`/admin?status=all&id=${encodeURIComponent(params.id)}`);
}
