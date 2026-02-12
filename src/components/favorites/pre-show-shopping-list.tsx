'use client';

import { ShoppingCart, ExternalLink } from 'lucide-react';
import { useWishlist } from '@/components/wishlist/wishlist-provider';
import { buildEbaySearchUrl } from '@/lib/ebay';

export function PreShowShoppingList({ showSlug }: { showSlug: string }) {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) return null;

  return (
    <div className="pt-4 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">Your Pre-Show Shopping List</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Cards from your wishlist to look for at this show:
      </p>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {wishlist.slice(0, 10).map((card) => (
          <div key={card.cardId} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={card.imageSmall}
                alt={card.name}
                className="h-8 w-6 rounded object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{card.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{card.setName}</p>
              </div>
            </div>
            <a
              href={buildEbaySearchUrl({ searchQuery: card.name + ' pokemon card', customId: `preshow-${showSlug}` })}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="shrink-0 p-1 rounded hover:bg-accent/20 transition-colors"
              aria-label={`Search ${card.name} on eBay`}
            >
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          </div>
        ))}
      </div>
      {wishlist.length > 10 && (
        <p className="text-xs text-muted-foreground mt-2">
          +{wishlist.length - 10} more cards on your wishlist
        </p>
      )}
    </div>
  );
}
