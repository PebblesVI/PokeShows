import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cardOfTheDay, cardPriceHistory } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getRandomCard, getCardById } from '@/lib/pokemon-tcg';
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

  // Record price history for today's card
  if (marketPrice != null) {
    await db.insert(cardPriceHistory).values({
      pokemonTcgId: card.id,
      variant: priceVariant,
      priceLow,
      priceMid,
      priceHigh,
      priceMarket: marketPrice,
      priceDirectLow,
      recordedDate: today,
    }).onConflictDoNothing();
  }

  // Refresh prices for recent featured cards
  try {
    const recentCards = await db.select({
      pokemonTcgId: cardOfTheDay.pokemonTcgId,
    })
      .from(cardOfTheDay)
      .orderBy(desc(cardOfTheDay.featuredDate))
      .limit(30);

    for (const recentCard of recentCards) {
      try {
        const freshCard = await getCardById(recentCard.pokemonTcgId);
        if (freshCard?.tcgplayer?.prices) {
          const priceKeys = Object.keys(freshCard.tcgplayer.prices);
          if (priceKeys.length > 0) {
            const bestKey = variantPreference.find(k => priceKeys.includes(k)) ?? priceKeys[0];
            const prices = freshCard.tcgplayer.prices[bestKey];
            if (prices) {
              await db.insert(cardPriceHistory).values({
                pokemonTcgId: recentCard.pokemonTcgId,
                variant: bestKey,
                priceLow: prices.low ?? null,
                priceMid: prices.mid ?? null,
                priceHigh: prices.high ?? null,
                priceMarket: prices.market ?? null,
                priceDirectLow: prices.directLow ?? null,
                recordedDate: today,
              }).onConflictDoNothing();
            }
          }
        }
      } catch {
        // Skip individual card failures
      }
    }
  } catch {
    // Don't fail the whole cron if price refresh fails
  }

  return NextResponse.json({ success: true, card: card.name });
}
