import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getSetById, getCardsBySet } from '@/lib/pokemon-tcg';
import { cardToSlug } from '@/lib/card-slug';
import { buildEbaySearchUrl } from '@/lib/ebay';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const set = await getSetById(id);
  if (!set) return { title: 'Set Not Found' };

  return {
    title: `Buy ${set.name} Pokemon Cards on eBay`,
    description: `Browse all ${set.printedTotal} cards from ${set.name} (${set.series}). Find singles, sealed products, and deals on eBay.`,
    openGraph: {
      title: `Buy ${set.name} Pokemon Cards | PokeShows`,
      description: `Browse and buy ${set.name} cards on eBay.`,
      images: [{ url: set.images.logo }],
    },
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

export default async function SetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [set, cards] = await Promise.all([
    getSetById(id),
    getCardsBySet(id, 100),
  ]);

  if (!set) notFound();

  const ebaySetUrl = buildEbaySearchUrl({
    searchQuery: `pokemon ${set.name} cards`,
    customId: `set-${id}`,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/buy/sets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All Sets
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
          <h1 className="text-3xl font-bold mb-1">{set.name}</h1>
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

      {/* Cards Grid */}
      {cards.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cards.map((card) => {
            const slug = cardToSlug(card.name, set.name);
            const price = getMarketPrice(card);

            return (
              <Link key={card.id} href={`/buy/${slug}`}>
                <div className="group rounded-xl border border-border p-3 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                  <div className="relative aspect-[2.5/3.5] mb-2 overflow-hidden rounded-lg">
                    <Image
                      src={card.images.small}
                      alt={`${card.name} #${card.number}`}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  </div>
                  <h3 className="text-xs font-semibold truncate group-hover:text-primary transition-colors duration-200">
                    {card.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">#{card.number}</p>
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
      ) : (
        <div className="text-center py-16 rounded-xl border border-border bg-muted/30">
          <p className="text-muted-foreground mb-4">Card data loading...</p>
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
