import { requireAdmin } from '@/app/admin/_lib/auth';
import { DeckImportForm } from '@/app/admin/_components/magic/DeckImportForm';
import { importDeck } from '../../actions';

export default async function AdminMagicImportDeckPage() {
  await requireAdmin();
  return <DeckImportForm action={importDeck} />;
}
