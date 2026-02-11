import { db } from '@/db';
import { cardOfTheDay } from '@/db/schema';
import { desc, lte } from 'drizzle-orm';
import { format } from 'date-fns';

export async function getCardOfTheDay() {
  const today = format(new Date(), 'yyyy-MM-dd');
  return db.query.cardOfTheDay.findFirst({
    where: lte(cardOfTheDay.featuredDate, today),
    orderBy: desc(cardOfTheDay.featuredDate),
  });
}

export async function getCardArchive(limit: number = 30) {
  return db.select()
    .from(cardOfTheDay)
    .orderBy(desc(cardOfTheDay.featuredDate))
    .limit(limit);
}
