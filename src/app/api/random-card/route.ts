import { NextRequest, NextResponse } from 'next/server';
import { getRandomCards, getRandomHoloCards, PokemonTcgCard } from '@/lib/pokemon-tcg';
import { db } from '@/db';
import { cardOfTheDay } from '@/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function formatCard(card: PokemonTcgCard) {
  let marketPrice: number | null = null;
  let priceVariant: string | null = null;

  if (card.tcgplayer?.prices) {
    const variantPreference = ['holofoil', 'reverseHolofoil', 'normal', '1stEditionHolofoil', '1stEditionNormal'];
    const priceKeys = Object.keys(card.tcgplayer.prices);
    if (priceKeys.length > 0) {
      const bestKey = variantPreference.find(k => priceKeys.includes(k)) ?? priceKeys[0];
      const prices = card.tcgplayer.prices[bestKey];
      if (prices) {
        marketPrice = prices.market ?? prices.mid ?? null;
        priceVariant = bestKey;
      }
    }
  }

  return {
    id: card.id,
    name: card.name,
    setName: card.set.name,
    setSeries: card.set.series,
    rarity: card.rarity,
    artist: card.artist,
    number: card.number,
    types: card.types,
    hp: card.hp,
    flavorText: card.flavorText,
    imageSmall: card.images.small,
    imageLarge: card.images.large,
    tcgPlayerUrl: card.tcgplayer?.url ?? null,
    marketPrice,
    priceVariant,
  };
}

async function getFallbackCardsFromDB(count: number) {
  const rows = await db.select()
    .from(cardOfTheDay)
    .orderBy(sql`RANDOM()`)
    .limit(count);

  return rows.map(row => ({
    id: row.pokemonTcgId,
    name: row.cardName,
    setName: row.setName,
    setSeries: row.setSeries ?? '',
    rarity: row.rarity,
    artist: row.artist,
    number: row.cardNumber ?? '',
    types: row.types ? JSON.parse(row.types) : null,
    hp: row.hp,
    flavorText: row.flavorText,
    imageSmall: row.imageSmall,
    imageLarge: row.imageLarge,
    tcgPlayerUrl: row.tcgPlayerUrl ?? null,
    marketPrice: row.tcgPlayerPrice,
    priceVariant: row.priceVariant,
  }));
}

export async function GET(request: NextRequest) {
  const isHolo = request.nextUrl.searchParams.get('holo') === 'true';

  try {
    // Try the external Pokemon TCG API first
    const rawCards = isHolo ? await getRandomHoloCards(10) : await getRandomCards(10);
    const cards = rawCards.map(formatCard);

    return NextResponse.json({ cards }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Pokemon TCG API failed, using DB fallback:', error);

    // Fallback: return random cards from the cardOfTheDay table
    try {
      const cards = await getFallbackCardsFromDB(10);
      if (cards.length > 0) {
        return NextResponse.json({ cards, source: 'fallback' }, {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          },
        });
      }
    } catch (dbError) {
      console.error('DB fallback also failed:', dbError);
    }

    return NextResponse.json({ error: 'Failed to fetch random cards' }, { status: 500 });
  }
}
