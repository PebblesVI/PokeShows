import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cardOfTheDay } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getRandomCard } from '@/lib/pokemon-tcg';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = format(new Date(), 'yyyy-MM-dd');

  const existing = await db.query.cardOfTheDay.findFirst({
    where: eq(cardOfTheDay.featuredDate, today),
  });

  if (existing) {
    return NextResponse.json({ message: 'Card already selected for today', card: existing.cardName });
  }

  let card = null;
  for (let i = 0; i < 3; i++) {
    const candidate = await getRandomCard();
    if (candidate.images?.large) {
      card = candidate;
      break;
    }
  }

  if (!card) {
    return NextResponse.json({ error: 'Failed to find a valid card' }, { status: 500 });
  }

  // Extract pricing from the best variant
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
      // Pick the best variant: preferred order, or first available
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

  return NextResponse.json({ success: true, card: card.name });
}
