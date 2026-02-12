import { NextRequest, NextResponse } from 'next/server';
import { searchCards } from '@/lib/pokemon-tcg';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { buildTcgPlayerAffiliateUrl } from '@/lib/tcgplayer-affiliate';

export const dynamic = 'force-dynamic';

function getMarketPrice(card: { tcgplayer?: { prices?: Record<string, { market?: number; mid?: number }> } }): { price: number | null; variant: string | null } {
  if (!card.tcgplayer?.prices) return { price: null, variant: null };
  const variants = ['holofoil', 'reverseHolofoil', 'normal', '1stEditionHolofoil', '1stEditionNormal'];
  const priceKeys = Object.keys(card.tcgplayer.prices);

  if (priceKeys.length === 0) return { price: null, variant: null };

  const bestKey = variants.find(k => priceKeys.includes(k)) ?? priceKeys[0];
  const prices = card.tcgplayer.prices[bestKey];
  if (!prices) return { price: null, variant: null };

  return {
    price: prices.market ?? prices.mid ?? null,
    variant: bestKey,
  };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  try {
    const { cards } = await searchCards(q.trim(), 10);

    const results = cards.map((card) => {
      const { price: marketPrice } = getMarketPrice(card);
      const searchQuery = `pokemon ${card.name} ${card.set.name}`;
      const ebayUrl = buildEbaySearchUrl({ searchQuery, customId: 'pricecheck' });
      const tcgPlayerUrl = card.tcgplayer?.url
        ? buildTcgPlayerAffiliateUrl(card.tcgplayer.url)
        : null;

      return {
        id: card.id,
        name: card.name,
        set: card.set.name,
        rarity: card.rarity,
        image: card.images.small,
        marketPrice,
        tcgPlayerUrl,
        ebayUrl,
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: 'Failed to search cards' }, { status: 500 });
  }
}
