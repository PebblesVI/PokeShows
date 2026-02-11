import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BuySearch } from '@/components/buy/buy-search';
import { searchCards } from '@/lib/pokemon-tcg';
import { cardToSlug } from '@/lib/card-slug';
import { buildEbaySearchUrl } from '@/lib/ebay';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  if (!query) return { title: 'Search Pokemon Cards to Buy' };

  return {
    title: `Buy "${query}" Pokemon Cards on eBay`,
    description: `Find ${query} Pokemon cards for sale. Compare prices across sellers and buy on eBay.`,
  };
}

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

export default async function BuySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const { cards, totalCount } = query ? await searchCards(query, 24) : { cards: [], totalCount: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Search Pokemon Cards</h1>
      <BuySearch defaultValue={query} />

      {query && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {totalCount > 0 ? (
                <>Found {totalCount.toLocaleString()} cards matching &ldquo;{query}&rdquo;</>
              ) : (
                <>No cards found for &ldquo;{query}&rdquo;</>
              )}
            </p>
            <a
              href={buildEbaySearchUrl({ searchQuery: `pokemon card ${query}`, customId: `search-${query.toLowerCase().replace(/\s+/g, '-')}` })}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Search eBay directly <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {cards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cards.map((card) => {
                const slug = cardToSlug(card.name, card.set.name);
                const price = getMarketPrice(card);

                return (
                  <Link key={card.id} href={`/buy/${slug}`}>
                    <div className="group rounded-xl border border-border p-3 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                      <div className="relative aspect-[2.5/3.5] mb-2 overflow-hidden rounded-lg">
                        <Image
                          src={card.images.small}
                          alt={`${card.name} from ${card.set.name}`}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        />
                      </div>
                      <h3 className="text-xs font-semibold truncate group-hover:text-primary transition-colors duration-200">
                        {card.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{card.set.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        {card.rarity && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                            {card.rarity}
                          </Badge>
                        )}
                        {price != null && (
                          <span className="text-xs font-medium text-primary">
                            ${price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {cards.length === 0 && query && (
            <div className="text-center py-16 rounded-xl border border-border bg-muted/30">
              <p className="text-muted-foreground mb-4">
                No matching Pokemon cards found in the database.
              </p>
              <a
                href={buildEbaySearchUrl({ searchQuery: `pokemon card ${query}`, customId: `search-${query.toLowerCase().replace(/\s+/g, '-')}` })}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-full text-sm font-medium hover:border-primary/30 hover:text-primary transition-all duration-200"
              >
                Try searching on eBay
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            Enter a Pokemon card name to find listings and compare prices.
          </p>
        </div>
      )}
    </div>
  );
}
