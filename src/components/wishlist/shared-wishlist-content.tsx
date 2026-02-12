'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ShoppingBag, Loader2 } from 'lucide-react';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { cardToSlug } from '@/lib/card-slug';

interface SharedCard {
  id: string;
  name: string;
  setName: string;
  setSeries: string;
  rarity: string | null;
  imageSmall: string;
  imageLarge: string;
  tcgPlayerUrl: string | null;
  marketPrice: number | null;
  priceVariant: string | null;
}

export function SharedWishlistContent({ cardIds }: { cardIds: string }) {
  const [cards, setCards] = useState<SharedCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch(`/api/wishlist-cards?ids=${encodeURIComponent(cardIds)}`);
        if (res.ok) {
          const data = await res.json();
          setCards(data.cards);
        }
      } catch {
        // Silently fail
      }
      setLoading(false);
    }
    fetchCards();
  }, [cardIds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading wishlist...</span>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground mb-4">
          Couldn&apos;t load any cards from this wishlist.
        </p>
        <Link
          href="/wishlist"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          Create Your Own Wishlist
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-8">
        {cards.length} {cards.length === 1 ? 'card' : 'cards'} in this wishlist
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cards.map(card => {
          const ebayUrl = buildEbaySearchUrl({
            searchQuery: `pokemon ${card.name} ${card.setName}`,
            customId: 'shared-wishlist',
          });
          const compareUrl = `/buy/${cardToSlug(card.name, card.setName)}`;

          return (
            <div key={card.id} className="rounded-xl border border-border p-3 hover:border-primary/30 transition-colors">
              <Image
                src={card.imageSmall}
                alt={`${card.name} from ${card.setName}`}
                width={245}
                height={342}
                className="rounded-lg w-full"
              />

              <div className="mt-2 space-y-1">
                <p className="font-medium text-sm leading-tight truncate">{card.name}</p>
                <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
                {card.rarity && (
                  <Badge variant="secondary" className="text-[10px]">{card.rarity}</Badge>
                )}
                {card.marketPrice != null && (
                  <p className="text-xs font-semibold text-primary">${card.marketPrice.toFixed(2)}</p>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                <a
                  href={ebayUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                >
                  Buy on eBay <ExternalLink className="h-3 w-3" />
                </a>
                <Link
                  href={compareUrl}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium border border-border rounded-full hover:border-primary/30 hover:text-primary transition-all"
                >
                  <ShoppingBag className="h-3 w-3" /> Compare
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA to create own wishlist */}
      <div className="mt-12 text-center rounded-xl border border-border bg-muted/50 p-8">
        <h3 className="font-semibold text-lg mb-2">Like what you see?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your own Pokemon card wishlist and share it with friends.
        </p>
        <Link
          href="/wishlist"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          Create Your Own Wishlist
        </Link>
      </div>

      {/* Accessories banner */}
      <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Card Supplies</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Card Sleeves', query: 'pokemon card sleeves' },
            { label: 'Top Loaders', query: 'card top loaders' },
            { label: 'Card Binder', query: 'pokemon card binder' },
          ].map(({ label, query }) => (
            <a
              key={label}
              href={buildEbaySearchUrl({ searchQuery: query, customId: 'shared-wishlist-gear' })}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              {label} <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
