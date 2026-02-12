import { NextRequest, NextResponse } from 'next/server';
import { getRandomCards, getRandomHoloCards, PokemonTcgCard } from '@/lib/pokemon-tcg';

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

export async function GET(request: NextRequest) {
  const isHolo = request.nextUrl.searchParams.get('holo') === 'true';

  try {
    // Always return a batch — client cycles through them instantly
    const rawCards = isHolo ? await getRandomHoloCards(25) : await getRandomCards(25);
    const cards = rawCards.map(formatCard);

    return NextResponse.json({ cards }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Random card error:', error);
    return NextResponse.json({ error: 'Failed to fetch random cards' }, { status: 500 });
  }
}
