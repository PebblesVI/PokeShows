import { db } from '@/db';
import { cardOfTheDay, cardPriceHistory } from '@/db/schema';
import { asc, desc, eq, lte } from 'drizzle-orm';
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

export async function getCardPriceHistory(pokemonTcgId: string) {
  return db.select()
    .from(cardPriceHistory)
    .where(eq(cardPriceHistory.pokemonTcgId, pokemonTcgId))
    .orderBy(asc(cardPriceHistory.recordedDate));
}
