export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GUIDES } from '@/lib/guides';
import { searchCardsAdvanced } from '@/lib/pokemon-tcg';
import { cardToSlug } from '@/lib/card-slug';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return { title: 'Guide Not Found' };

  return {
    title: guide.title,
    description: guide.description,
    openGraph: {
      title: `${guide.title} | PokeShows`,
      description: guide.description,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  const { cards: rawCards } = await searchCardsAdvanced(guide.query, guide.sortBy, guide.limit);

  // Apply maxPrice filter if configured
  let cards = rawCards;
  if (guide.maxPrice != null) {
    cards = rawCards.filter((card) => {
      const price = getMarketPrice(card);
      return price != null && price < guide.maxPrice!;
    });
  }

  const ebayGuideUrl = buildEbaySearchUrl({
    searchQuery: 'pokemon cards',
    customId: `guide-${slug}`,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All Guides
      </Link>

      <h1 className="text-3xl font-bold mb-3 tracking-tight">{guide.title}</h1>
      <p className="text-muted-foreground mb-10 max-w-3xl">{guide.intro}</p>

      {cards.length > 0 ? (
        <div className="space-y-4">
          {cards.map((card, index) => {
            const price = getMarketPrice(card);
            const buySlug = cardToSlug(card.name, card.set.name);
            const ebayUrl = buildEbaySearchUrl({
              searchQuery: `pokemon card ${card.name} ${card.set.name}`,
              customId: `guide-${slug}`,
            });

            return (
              <div
                key={card.id}
                className="flex items-center gap-4 rounded-xl border border-border p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
              >
                {/* Rank */}
                <div className="text-2xl font-bold text-muted-foreground/40 w-8 text-center shrink-0">
                  {index + 1}
                </div>

                {/* Card image */}
                <div className="relative w-16 h-22 shrink-0">
                  <Image
                    src={card.images.small}
                    alt={card.name}
                    width={100}
                    height={140}
                    className="rounded-lg object-contain"
                  />
                </div>

                {/* Card info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/cards/${card.id}`} className="hover:text-primary transition-colors duration-200">
                    <h3 className="font-semibold truncate">{card.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground truncate">
                    {card.set.name} &mdash; {card.set.series}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {card.rarity && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                        {card.rarity}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  {price != null ? (
                    <p className="text-lg font-semibold text-primary">${price.toFixed(2)}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">N/A</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    href={`/buy/${buySlug}`}
                    className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
                  >
                    Buy
                  </Link>
                  <a
                    href={ebayUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
                  >
                    eBay
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-border bg-muted/30">
          <p className="text-muted-foreground">
            No cards found matching this guide&apos;s criteria. Try again later.
          </p>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <a
          href={ebayGuideUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          Shop All These Cards on eBay
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
