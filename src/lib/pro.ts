import { db } from '@/db';
import { proSubscriptions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function isProUser(email: string): Promise<boolean> {
  if (!email) return false;
  const [sub] = await db.select()
    .from(proSubscriptions)
    .where(and(
      eq(proSubscriptions.email, email),
      eq(proSubscriptions.status, 'active'),
    ))
    .limit(1);

  if (!sub) return false;
  if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date()) return false;
  return true;
}

export function getProBadge() {
  return {
    text: 'PRO',
    className: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full',
  };
}
