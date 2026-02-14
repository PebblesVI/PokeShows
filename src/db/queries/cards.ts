import { db } from '@/db';
import { cardOfTheDay, cardPriceHistory } from '@/db/schema';
import { asc, desc, eq, lte } from 'drizzle-orm';
import { format } from 'date-fns';
import { getRandomCard } from '@/lib/pokemon-tcg';

// Cache today's card in-memory to avoid duplicate DB/API calls within a single request
let _cachedCard: { date: string; card: Awaited<ReturnType<typeof _fetchCardOfTheDay>> } | null = null;

export async function getCardOfTheDay() {
  const today = format(new Date(), 'yyyy-MM-dd');
  if (_cachedCard?.date === today && _cachedCard.card) {
    return _cachedCard.card;
  }
  const card = await _fetchCardOfTheDay(today);
  _cachedCard = { date: today, card };
  return card;
}

async function _fetchCardOfTheDay(today: string) {
  // Check if we already have a card for today
  const existing = await db.query.cardOfTheDay.findFirst({
    where: eq(cardOfTheDay.featuredDate, today),
  });
  if (existing) return existing;

  // Self-heal: if the cron missed today, pick a card now
  try {
    // Get previously featured cards to avoid repeats
    const previousCards = await db.select({ pokemonTcgId: cardOfTheDay.pokemonTcgId })
      .from(cardOfTheDay)
      .orderBy(desc(cardOfTheDay.featuredDate))
      .limit(200);
    const previousIds = new Set(previousCards.map(c => c.pokemonTcgId));

    let apiCard = null;
    for (let i = 0; i < 5; i++) {
      const candidate = await getRandomCard();
      if (candidate?.images?.large && !previousIds.has(candidate.id)) {
        apiCard = candidate;
        break;
      }
    }

    if (apiCard) {
      const variantPreference = ['holofoil', 'reverseHolofoil', 'normal', '1stEditionHolofoil', '1stEditionNormal'];
      let marketPrice: number | null = null;
      let priceLow: number | null = null;
      let priceMid: number | null = null;
      let priceHigh: number | null = null;
      let priceDirectLow: number | null = null;
      let priceVariant: string | null = null;

      if (apiCard.tcgplayer?.prices) {
        const priceKeys = Object.keys(apiCard.tcgplayer.prices);
        if (priceKeys.length > 0) {
          const bestKey = variantPreference.find(k => priceKeys.includes(k)) ?? priceKeys[0];
          const prices = apiCard.tcgplayer.prices[bestKey];
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
        pokemonTcgId: apiCard.id,
        cardName: apiCard.name,
        setName: apiCard.set.name,
        setSeries: apiCard.set.series,
        rarity: apiCard.rarity,
        artist: apiCard.artist,
        cardNumber: apiCard.number,
        types: apiCard.types ? JSON.stringify(apiCard.types) : null,
        hp: apiCard.hp,
        flavorText: apiCard.flavorText,
        imageSmall: apiCard.images.small,
        imageLarge: apiCard.images.large,
        tcgPlayerUrl: apiCard.tcgplayer?.url,
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
