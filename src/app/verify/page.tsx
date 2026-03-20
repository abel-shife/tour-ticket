import { requireAuth } from '@/actions/auth';
import VerifyClient from './VerifyClient';

export default async function VerifyPage() {
  const session = await requireAuth();
  return <VerifyClient session={session} />;
}
