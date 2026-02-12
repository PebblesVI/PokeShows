import { db } from '@/db';
import { cardOfTheDay, cardPriceHistory } from '@/db/schema';
import { asc, desc, eq, lte } from 'drizzle-orm';
import { format } from 'date-fns';
import { getRandomCard } from '@/lib/pokemon-tcg';

export async function getCardOfTheDay() {
  const today = format(new Date(), 'yyyy-MM-dd');

  // Check if we already have a card for today
  const existing = await db.query.cardOfTheDay.findFirst({
    where: eq(cardOfTheDay.featuredDate, today),
  });
  if (existing) return existing;

  // Self-heal: if the cron missed today, pick a card now
  try {
    const card = await getRandomCard();
    if (card?.images?.large) {
      const variantPreference = ['holofoil', 'reverseHolofoil', 'normal', '1stEditionHolofoil', '1stEditionNormal'];
      let marketPrice: number | null = null;
      let priceLow: number | null = null;
      let priceMid: number | null = null;
      let priceHigh: number | null = null;
      let priceDirectLow: number | null = null;
      let priceVariant: string | null = null;

      if (card.tcgplayer?.prices) {
        const priceKeys = Object.keys(card.tcgplayer.prices);
        if (priceKeys.length > 0) {
          const bestKey = variantPreference.find(k => priceKeys.includes(k)) ?? priceKeys[0];
          const prices = card.tcgplayer.prices[bestKey];
          if (prices) {
            priceVariant = bestKey;
            marketPrice = prices.market ?? null;
            priceLow = prices.low ?? null;
            priceMid = prices.mid ?? null;
            priceHigh = prices.high ?? null;
            priceDirectLow = prices.directLow ?? null;
          }
        }
      }

      await db.insert(cardOfTheDay).values({
        featuredDate: today,
        pokemonTcgId: card.id,
        cardName: card.name,
        setName: card.set.name,
        setSeries: card.set.series,
        rarity: card.rarity,
        artist: card.artist,
        cardNumber: card.number,
        types: card.types ? JSON.stringify(card.types) : null,
        hp: card.hp,
        flavorText: card.flavorText,
        imageSmall: card.images.small,
        imageLarge: card.images.large,
        tcgPlayerUrl: card.tcgplayer?.url,
        tcgPlayerPrice: marketPrice,
        priceLow,
        priceMid,
        priceHigh,
        priceDirectLow,
        priceVariant,
      });

      return db.query.cardOfTheDay.findFirst({
        where: eq(cardOfTheDay.featuredDate, today),
      });
    }
  } catch {
    // Fall through to show most recent card
  }

  // Fallback: show the most recent card
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
