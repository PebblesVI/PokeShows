export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getPopularCardSearches } from '@/db/queries/listings';
import { SHOP_CATEGORIES } from '@/lib/constants';
import { cardToSlug } from '@/lib/card-slug';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { BuySearch } from '@/components/buy/buy-search';

export const metadata: Metadata = {
  title: 'Buy Pokemon Cards — Shop eBay Deals',
  description: 'Browse Pokemon cards on eBay. Find booster boxes, graded cards, vintage singles, and more at the best prices.',
  openGraph: {
    title: 'Buy Pokemon Cards — Shop eBay Deals | PokeShows',
    description: 'Browse Pokemon cards on eBay. Find booster boxes, graded cards, vintage singles, and more.',
  },
};

export default async function BuyIndexPage() {
  const recentCards = await getPopularCardSearches(12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Buy Pokemon Cards</h1>
      <p className="text-muted-foreground mb-8">
        Find the best deals on Pokemon cards, sealed products, and accessories on eBay.
      </p>

      <div className="mb-12">
        <BuySearch />
      </div>

      {/* Category Browse */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Browse by Category</h2>
          <Link
            href="/buy/sets"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Browse by Set &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SHOP_CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/buy/category/${category.slug}`}>
              <div className="group rounded-xl border border-border p-5 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                <h3 className="font-semibold group-hover:text-primary transition-colors duration-200">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {category.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-primary mt-3 font-medium">
                  Browse listings <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Card of the Day — Buy Links */}
      {recentCards.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recently Featured Cards</h2>
            <Link
              href="/card-of-the-day"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              See all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentCards.map((card) => {
              const slug = cardToSlug(card.cardName, card.setName);
              return (
                <Link key={card.pokemonTcgId} href={`/buy/${slug}`}>
                  <div className="group rounded-xl border border-border p-3 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                    <div className="relative aspect-[2.5/3.5] mb-2 overflow-hidden rounded-lg">
                      <Image
                        src={card.imageSmall}
                        alt={card.cardName}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    </div>
                    <h3 className="text-xs font-semibold truncate">{card.cardName}</h3>
                    <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
                    <div className="flex items-center justify-between mt-1">
                      {card.rarity && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                          {card.rarity}
                        </Badge>
                      )}
                      {card.tcgPlayerPrice != null && (
                        <span className="text-xs font-medium text-primary">
                          ${card.tcgPlayerPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Search Links */}
      <section className="rounded-xl bg-muted/30 p-8">
        <h2 className="text-xl font-semibold mb-4">Popular Searches</h2>
        <div className="flex flex-wrap gap-2">
          {[
            'Charizard', 'Pikachu VMAX', 'Mewtwo GX', 'Lugia', 'Umbreon',
            'Rayquaza', 'Gengar', 'Eevee', 'Mew', 'Gardevoir',
            'Base Set Holo', 'Scarlet Violet', 'Crown Zenith',
          ].map((term) => (
            <a
              key={term}
              href={buildEbaySearchUrl({ searchQuery: `pokemon card ${term}`, customId: `buy-popular-${term.toLowerCase().replace(/\s+/g, '-')}` })}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary/30 hover:text-primary transition-all duration-200"
            >
              {term}
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
