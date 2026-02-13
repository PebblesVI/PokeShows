'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Heart, RefreshCw, ExternalLink } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { cardToSlug } from '@/lib/card-slug';

interface TrendingCard {
  pokemonTcgId: string;
  cardName: string;
  setName: string;
  imageSmall: string;
  previousPrice: number;
  currentPrice: number;
  changePercent: number;
}

interface WishlistedCard {
  pokemonTcgId: string;
  cardName: string;
  setName: string;
  imageSmall: string;
  currentPrice: number | null;
  wishlistCount: number;
}

interface TrendingData {
  gainers: TrendingCard[];
  losers: TrendingCard[];
  mostWishlisted: WishlistedCard[];
  updatedAt: string;
}

function CardImage({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="w-16 h-22 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <span className="text-xs text-muted-foreground">No img</span>
      </div>
    );
  }
  return (
    <div className="relative w-16 h-[88px] shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain rounded-lg"
        sizes="64px"
      />
    </div>
  );
}

function GainerCard({ card }: { card: TrendingCard }) {
  const slug = card.cardName && card.setName ? cardToSlug(card.cardName, card.setName) : null;
  const ebayUrl = buildEbaySearchUrl({
    searchQuery: `pokemon ${card.cardName} ${card.setName}`,
    customId: `trending-gainer-${card.pokemonTcgId}`,
  });

  return (
    <div className="rounded-xl border border-border p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
      <div className="flex gap-4">
        <CardImage src={card.imageSmall} alt={card.cardName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {slug ? (
                <Link href={`/buy/${slug}`} className="text-sm font-semibold hover:text-primary transition-colors truncate block">
                  {card.cardName}
                </Link>
              ) : (
                <p className="text-sm font-semibold truncate">{card.cardName}</p>
              )}
              <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shrink-0">
              <TrendingUp className="h-3 w-3" />
              +{card.changePercent}%
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-xs text-muted-foreground">
              <span className="line-through">${card.previousPrice.toFixed(2)}</span>
            </div>
            <div className="text-sm font-bold text-green-600 dark:text-green-400">
              ${card.currentPrice.toFixed(2)}
            </div>
          </div>
          <a
            href={ebayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
          >
            Buy Now on eBay <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function LoserCard({ card }: { card: TrendingCard }) {
  const slug = card.cardName && card.setName ? cardToSlug(card.cardName, card.setName) : null;
  const ebayUrl = buildEbaySearchUrl({
    searchQuery: `pokemon ${card.cardName} ${card.setName}`,
    customId: `trending-deal-${card.pokemonTcgId}`,
  });

  return (
    <div className="rounded-xl border border-border p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
      <div className="flex gap-4">
        <CardImage src={card.imageSmall} alt={card.cardName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {slug ? (
                <Link href={`/buy/${slug}`} className="text-sm font-semibold hover:text-primary transition-colors truncate block">
                  {card.cardName}
                </Link>
              ) : (
                <p className="text-sm font-semibold truncate">{card.cardName}</p>
              )}
              <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shrink-0">
              <TrendingDown className="h-3 w-3" />
              {card.changePercent}%
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-xs text-muted-foreground">
              <span className="line-through">${card.previousPrice.toFixed(2)}</span>
            </div>
            <div className="text-sm font-bold text-red-600 dark:text-red-400">
              ${card.currentPrice.toFixed(2)}
            </div>
          </div>
          <a
            href={ebayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
          >
            Great Deal — Buy Now <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function WishlistCard({ card }: { card: WishlistedCard }) {
  const slug = card.cardName && card.setName ? cardToSlug(card.cardName, card.setName) : null;
  const ebayUrl = buildEbaySearchUrl({
    searchQuery: `pokemon ${card.cardName} ${card.setName}`,
    customId: `trending-wishlisted-${card.pokemonTcgId}`,
  });

  return (
    <div className="rounded-xl border border-border p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
      <div className="flex gap-4">
        <CardImage src={card.imageSmall} alt={card.cardName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {slug ? (
                <Link href={`/buy/${slug}`} className="text-sm font-semibold hover:text-primary transition-colors truncate block">
                  {card.cardName}
                </Link>
              ) : (
                <p className="text-sm font-semibold truncate">{card.cardName}</p>
              )}
              <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              <Heart className="h-3 w-3" />
              {card.wishlistCount}
            </Badge>
          </div>
          {card.currentPrice !== null && (
            <p className="text-sm font-bold mt-2">${card.currentPrice.toFixed(2)}</p>
          )}
          <a
            href={ebayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
          >
            Buy Now on eBay <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 rounded-xl border border-border">
      <p className="text-lg text-muted-foreground mb-2">
        Price data is still being collected. Check back soon!
      </p>
      <p className="text-sm text-muted-foreground">
        As card prices are tracked daily, trending data will appear here.
      </p>
    </div>
  );
}

export function TrendingContent() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trending');
      if (!res.ok) throw new Error('Failed to fetch');
      const json: TrendingData = await res.json();
      setData(json);
    } catch {
      setError('Could not load trending data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-[88px] bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 rounded-xl border border-border">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      </div>
    );
  }

  const hasGainers = data && data.gainers.length > 0;
  const hasLosers = data && data.losers.length > 0;
  const hasWishlisted = data && data.mostWishlisted.length > 0;
  const hasAnyData = hasGainers || hasLosers || hasWishlisted;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        {data?.updatedAt && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(data.updatedAt).toLocaleString()}
          </p>
        )}
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {!hasAnyData ? (
        <EmptyState />
      ) : (
        <Tabs defaultValue="gainers">
          <TabsList className="mb-6">
            <TabsTrigger value="gainers">
              <TrendingUp className="h-4 w-4" />
              Price Gainers
            </TabsTrigger>
            <TabsTrigger value="losers">
              <TrendingDown className="h-4 w-4" />
              Price Drops
            </TabsTrigger>
            <TabsTrigger value="wishlisted">
              <Heart className="h-4 w-4" />
              Most Wishlisted
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gainers">
            {hasGainers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data!.gainers.map((card) => (
                  <GainerCard key={card.pokemonTcgId} card={card} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="losers">
            {hasLosers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data!.losers.map((card) => (
                  <LoserCard key={card.pokemonTcgId} card={card} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="wishlisted">
            {hasWishlisted ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data!.mostWishlisted.map((card) => (
                  <WishlistCard key={card.pokemonTcgId} card={card} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-xl border border-border">
                <p className="text-lg text-muted-foreground mb-2">
                  No wishlisted cards yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Add cards to your wishlist to see what&apos;s popular!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Bottom CTA */}
      <section className="mt-16 pt-12 border-t border-border text-center">
        <p className="text-muted-foreground mb-4">
          Want alerts when these cards drop in price?
        </p>
        <Link
          href="/wishlist"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Heart className="h-4 w-4" />
          Set Up Wishlist Alerts
        </Link>
      </section>
    </div>
  );
}
