export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getSetById, getCardsBySet } from '@/lib/pokemon-tcg';
import { buildEbaySearchUrl } from '@/lib/ebay';

function getMarketPrice(card: { tcgplayer?: { prices?: Record<string, { market?: number }> } }): number | null {
  if (!card.tcgplayer?.prices) return null;
  const variants = ['holofoil', 'reverseHolofoil', 'normal', '1stEditionHolofoil'];
  for (const v of variants) {
    const price = card.tcgplayer.prices[v]?.market;
    if (price != null) return price;
  }
  const firstKey = Object.keys(card.tcgplayer.prices)[0];
  return firstKey ? card.tcgplayer.prices[firstKey]?.market ?? null : null;
}

function getPriceDetails(card: { tcgplayer?: { prices?: Record<string, { low?: number; mid?: number; high?: number; market?: number }> } }): {
  low: number | null;
  mid: number | null;
  high: number | null;
  market: number | null;
} {
  if (!card.tcgplayer?.prices) return { low: null, mid: null, high: null, market: null };
  const variants = ['holofoil', 'reverseHolofoil', 'normal', '1stEditionHolofoil'];
  for (const v of variants) {
    const prices = card.tcgplayer.prices[v];
    if (prices?.market != null) {
      return {
        low: prices.low ?? null,
        mid: prices.mid ?? null,
        high: prices.high ?? null,
        market: prices.market ?? null,
      };
    }
  }
  const firstKey = Object.keys(card.tcgplayer.prices)[0];
  if (firstKey) {
    const prices = card.tcgplayer.prices[firstKey];
    return {
      low: prices?.low ?? null,
      mid: prices?.mid ?? null,
      high: prices?.high ?? null,
      market: prices?.market ?? null,
    };
  }
  return { low: null, mid: null, high: null, market: null };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const set = await getSetById(id);
  if (!set) return { title: 'Set Not Found' };

  return {
    title: `${set.name} Price Guide — Complete Pokemon Card Price List`,
    description: `Complete price guide for all ${set.printedTotal} cards in ${set.name} (${set.series}). View market prices, low, mid, and high values for every card.`,
    openGraph: {
      title: `${set.name} Price Guide | PokeShows`,
      description: `Complete price list for ${set.name} Pokemon cards.`,
      images: [{ url: set.images.logo }],
    },
  };
}

export default async function SetPriceGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [set, cards] = await Promise.all([
    getSetById(id),
    getCardsBySet(id, 250),
  ]);

  if (!set) notFound();

  const ebaySetUrl = buildEbaySearchUrl({
    searchQuery: `pokemon ${set.name} cards`,
    customId: `set-prices-${id}`,
  });

  // Sort cards by market price descending
  const sortedCards = [...cards].sort((a, b) => {
    const priceA = getMarketPrice(a) ?? 0;
    const priceB = getMarketPrice(b) ?? 0;
    return priceB - priceA;
  });

  // Calculate total set value
  const totalSetValue = sortedCards.reduce((sum, card) => {
    const price = getMarketPrice(card);
    return sum + (price ?? 0);
  }, 0);

  const cardsWithPrice = sortedCards.filter((c) => getMarketPrice(c) != null).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={`/buy/set/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {set.name}
      </Link>

      {/* Set Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
        <div className="relative h-16 w-40 shrink-0">
          <Image
            src={set.images.logo}
            alt={set.name}
            fill
            className="object-contain object-left"
            sizes="160px"
            priority
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{set.name} Price Guide</h1>
          <p className="text-muted-foreground text-sm">
            {set.series} &middot; {set.printedTotal} cards &middot; Released {set.releaseDate}
          </p>
        </div>
        <a
          href={ebaySetUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity shrink-0"
        >
          Shop Set on eBay
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Set Value Summary */}
      <div className="rounded-xl border border-border bg-muted/50 p-6 mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Set Value</p>
            <p className="text-2xl font-bold text-primary">${totalSetValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Cards in Set</p>
            <p className="text-2xl font-bold">{set.printedTotal}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Cards Priced</p>
            <p className="text-2xl font-bold">{cardsWithPrice}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Average Price</p>
            <p className="text-2xl font-bold">
              ${cardsWithPrice > 0 ? (totalSetValue / cardsWithPrice).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Full Price Table */}
      {sortedCards.length > 0 ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Card Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Rarity</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Market</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Low</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Mid</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">High</th>
                </tr>
              </thead>
              <tbody>
                {sortedCards.map((card) => {
                  const prices = getPriceDetails(card);
                  return (
                    <tr key={card.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">
                        {card.number}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/cards/${card.id}`}
                          className="font-medium hover:text-primary transition-colors duration-200"
                        >
                          {card.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {card.rarity ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                            {card.rarity}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">
                        {prices.market != null ? `$${prices.market.toFixed(2)}` : <span className="text-muted-foreground">&mdash;</span>}
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        {prices.low != null ? `$${prices.low.toFixed(2)}` : <span className="text-muted-foreground">&mdash;</span>}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        {prices.mid != null ? `$${prices.mid.toFixed(2)}` : <span className="text-muted-foreground">&mdash;</span>}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        {prices.high != null ? `$${prices.high.toFixed(2)}` : <span className="text-muted-foreground">&mdash;</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-border bg-muted/30">
          <p className="text-muted-foreground mb-4">Price data loading...</p>
          <a
            href={ebaySetUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-full text-sm font-medium hover:border-primary/30 hover:text-primary transition-all duration-200"
          >
            Browse on eBay
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
