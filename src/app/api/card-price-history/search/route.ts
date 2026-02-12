import { NextRequest, NextResponse } from 'next/server';
import { searchCards } from '@/lib/pokemon-tcg';

export const dynamic = 'force-dynamic';

const VARIANT_PREFERENCE = ['holofoil', 'reverseHolofoil', 'normal', '1stEditionHolofoil', '1stEditionNormal'];

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  try {
    const { cards } = await searchCards(q.trim(), 8);

    const results = cards.map((card) => {
      let priceLow: number | null = null;
      let priceMid: number | null = null;
      let priceHigh: number | null = null;
      let priceMarket: number | null = null;
      let variant: string | null = null;

      if (card.tcgplayer?.prices) {
        const priceKeys = Object.keys(card.tcgplayer.prices);
        if (priceKeys.length > 0) {
          const bestKey = VARIANT_PREFERENCE.find(k => priceKeys.includes(k)) ?? priceKeys[0];
          const prices = card.tcgplayer.prices[bestKey];
          if (prices) {
            variant = bestKey;
            priceLow = prices.low ?? null;
            priceMid = prices.mid ?? null;
            priceHigh = prices.high ?? null;
            priceMarket = prices.market ?? null;
          }
        }
      }

      return {
        id: card.id,
        name: card.name,
        setName: card.set.name,
        imageSmall: card.images.small,
        priceLow,
        priceMid,
        priceHigh,
        priceMarket,
        variant,
      };
    });

    return NextResponse.json({ cards: results });
  } catch {
    return NextResponse.json({ error: 'Failed to search cards' }, { status: 500 });
  }
}
