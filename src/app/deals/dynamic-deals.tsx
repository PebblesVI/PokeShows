'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TrendingDown, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DealCard {
  pokemonTcgId: string;
  cardName: string;
  setName: string;
  imageSmall: string;
  previousPrice: number;
  currentPrice: number;
  dropPercent: number;
  ebayUrl: string;
  tcgPlayerUrl: string;
}

export function DynamicDeals() {
  const [deals, setDeals] = useState<DealCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch('/api/deals/dynamic');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setDeals(data.deals || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, []);

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingDown className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-semibold">Today&apos;s Price Drops</h2>
        </div>
        <div className="flex items-center justify-center py-12 rounded-xl border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Finding deals...</span>
        </div>
      </section>
    );
  }

  if (error || deals.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingDown className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-semibold">Today&apos;s Price Drops</h2>
        </div>
        <div className="text-center py-12 rounded-xl border border-border bg-muted/30">
          <p className="text-muted-foreground mb-1">No major price drops detected today.</p>
          <p className="text-sm text-muted-foreground">
            We check for cards that dropped 15%+ in the last 2 days. Check back tomorrow!
          </p>
        </div>
      </section>
    );
  }

  // Split deals into "Price Drops" (top 4) and "Trending Steals" (next 4 if available)
  const priceDrops = deals.slice(0, 4);
  const trendingSteals = deals.slice(4, 8);

  return (
    <>
      {/* Today's Price Drops */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingDown className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-semibold">Today&apos;s Price Drops</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Cards that dropped 15%+ in the last 2 days. Grab them before prices recover.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {priceDrops.map((deal) => (
            <DealCardComponent key={deal.pokemonTcgId} deal={deal} />
          ))}
        </div>
      </section>

      {/* Trending Steals (if we have more than 4 deals) */}
      {trendingSteals.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Trending Steals</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            More cards with significant price drops. Compare across eBay and TCGPlayer.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {trendingSteals.map((deal) => (
              <DealCardComponent key={deal.pokemonTcgId} deal={deal} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function DealCardComponent({ deal }: { deal: DealCard }) {
  return (
    <div className="rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
      <div className="flex gap-4">
        {/* Card image */}
        {deal.imageSmall ? (
          <div className="relative w-16 h-[88px] shrink-0">
            <Image
              src={deal.imageSmall}
              alt={deal.cardName}
              fill
              className="object-contain rounded-lg"
              sizes="64px"
            />
          </div>
        ) : (
          <div className="w-16 h-[88px] rounded-lg bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs text-muted-foreground">No img</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{deal.cardName}</p>
              <p className="text-xs text-muted-foreground truncate">{deal.setName}</p>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shrink-0">
              <TrendingDown className="h-3 w-3" />
              -{deal.dropPercent}%
            </Badge>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground line-through">
              ${deal.previousPrice.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">
              ${deal.currentPrice.toFixed(2)}
            </span>
          </div>

          {/* Buy links */}
          <div className="flex items-center gap-2 mt-3">
            <a
              href={deal.ebayUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              eBay <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={deal.tcgPlayerUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              TCGPlayer <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
