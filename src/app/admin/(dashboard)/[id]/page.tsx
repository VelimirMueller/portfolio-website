import { redirect } from 'next/navigation';

/** Old per-message URLs (pre split view) open in the inbox workspace. */
export default async function LegacyMessagePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  redirect(`/admin?status=all&id=${encodeURIComponent(params.id)}`);
}
