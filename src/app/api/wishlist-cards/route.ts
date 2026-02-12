import { NextRequest, NextResponse } from 'next/server';
import { getCardById } from '@/lib/pokemon-tcg';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get('ids');
  if (!idsParam) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
  }

  const ids = idsParam.split(',').slice(0, 20); // Cap at 20 cards

  const cards = [];
  for (const id of ids) {
    try {
      const card = await getCardById(id.trim());
      if (card) {
        // Extract best pricing
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

        cards.push({
          id: card.id,
          name: card.name,
          setName: card.set.name,
          setSeries: card.set.series,
          rarity: card.rarity,
          imageSmall: card.images.small,
          imageLarge: card.images.large,
          tcgPlayerUrl: card.tcgplayer?.url ?? null,
          marketPrice,
          priceVariant,
        });
      }
    } catch {
      // Skip cards that fail to fetch
    }
  }

  return NextResponse.json({ cards });
}
