import { NextRequest, NextResponse } from 'next/server';
import { getRandomCard, getRandomHoloCard } from '@/lib/pokemon-tcg';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const isHolo = request.nextUrl.searchParams.get('holo') === 'true';

  try {
    const card = isHolo ? await getRandomHoloCard() : await getRandomCard();

    if (!card?.images?.large) {
      return NextResponse.json({ error: 'Failed to find a valid card' }, { status: 500 });
    }

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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Random card error:', error);
    return NextResponse.json({ error: 'Failed to fetch random card' }, { status: 500 });
  }
}
