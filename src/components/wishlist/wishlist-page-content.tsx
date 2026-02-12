'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Trash2, Share2, Check, ShoppingBag, Bell } from 'lucide-react';
import { useWishlist } from './wishlist-provider';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { cardToSlug } from '@/lib/card-slug';
import { Button } from '@/components/ui/button';

export function WishlistPageContent() {
  const { wishlist, removeCard } = useWishlist();
  const [copied, setCopied] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertStatus, setAlertStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleShare = async () => {
    const ids = wishlist.map(c => c.cardId).join(',');
    const url = `${window.location.origin}/wishlist/shared?cards=${encodeURIComponent(ids)}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground mb-4">
          No cards in your wishlist yet.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Search for cards to start building your wishlist!
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/buy/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Search Cards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:opacity-90 transition-opacity text-sm"
        >
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {copied ? 'Link Copied!' : 'Share Wishlist'}
        </button>
        <span className="text-sm text-muted-foreground">
          {wishlist.length} {wishlist.length === 1 ? 'card' : 'cards'}
        </span>
      </div>

      {/* Price Drop Alert CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Get Price Drop Alerts</h3>
        </div>
        {alertStatus === 'success' ? (
          <p className="text-sm text-green-600 dark:text-green-400">
            You&apos;re subscribed! We&apos;ll email you when any card on your wishlist drops 10%+ in price.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Get notified when any card on your wishlist drops in price. Alerts include direct buy links.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!alertEmail.includes('@')) return;
                setAlertStatus('loading');
                try {
                  const res = await fetch('/api/wishlist-alerts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: alertEmail,
                      cardIds: wishlist.map(c => c.cardId),
                      thresholdPercent: 10,
                    }),
                  });
                  setAlertStatus(res.ok ? 'success' : 'error');
                } catch {
                  setAlertStatus('error');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button type="submit" size="sm" disabled={alertStatus === 'loading'} className="gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                {alertStatus === 'loading' ? 'Saving...' : 'Alert Me'}
              </Button>
            </form>
            {alertStatus === 'error' && (
              <p className="text-xs text-red-500 mt-2">Something went wrong. Please try again.</p>
            )}
          </>
        )}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {wishlist.map(card => {
          const ebayUrl = buildEbaySearchUrl({
            searchQuery: `pokemon ${card.name} ${card.setName}`,
            customId: `wishlist-${cardToSlug(card.name, card.setName)}`,
          });
          const compareUrl = `/buy/${cardToSlug(card.name, card.setName)}`;

          return (
            <div key={card.cardId} className="group relative rounded-xl border border-border p-3 hover:border-primary/30 transition-colors">
              {/* Remove button */}
              <button
                onClick={() => removeCard(card.cardId)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 z-10"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {/* Card image */}
              <Image
                src={card.imageSmall}
                alt={`${card.name} from ${card.setName}`}
                width={245}
                height={342}
                className="rounded-lg w-full"
              />

              {/* Card info */}
              <div className="mt-2 space-y-1">
                <p className="font-medium text-sm leading-tight truncate">{card.name}</p>
                <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
                {card.rarity && (
                  <Badge variant="secondary" className="text-[10px]">{card.rarity}</Badge>
                )}
              </div>

              {/* Action buttons */}
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

      {/* Accessories banner */}
      <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Protect Your Collection</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Keep your wishlist cards safe with the right supplies.</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Card Sleeves', query: 'pokemon card penny sleeves' },
            { label: 'Top Loaders', query: 'ultra pro top loaders 35pt' },
            { label: 'PSA Slab Cases', query: 'PSA graded card storage case' },
            { label: 'Magnetic Holders', query: 'magnetic card holder 35pt one touch' },
          ].map(({ label, query }) => (
            <a
              key={label}
              href={buildEbaySearchUrl({ searchQuery: query, customId: 'wishlist-accessories' })}
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
