'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { buildEbaySearchUrl } from '@/lib/ebay';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  ShoppingCart,
  Mail,
} from 'lucide-react';

interface SetInfo {
  id: string;
  name: string;
  series: string;
  total: number;
  printedTotal: number;
  logoUrl: string;
}

interface SetCard {
  id: string;
  name: string;
  number: string;
  rarity: string | null;
  imageSmall: string;
  setId: string;
  setName: string;
}

interface CollectionCard {
  pokemonTcgId: string;
}

interface SetCompletionContentProps {
  set: SetInfo;
  allCards: SetCard[];
}

export function SetCompletionContent({ set, allCards }: SetCompletionContentProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Read email from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pokeshows-email');
    if (stored) {
      setEmail(stored);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCollectionForSet = useCallback(async (userEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/collection?email=${encodeURIComponent(userEmail)}&setId=${encodeURIComponent(set.id)}`,
      );
      const data = await res.json();
      if (data.cards) {
        setCollectedIds(new Set(data.cards.map((c: CollectionCard) => c.pokemonTcgId)));
      }
    } catch (err) {
      console.error('Failed to fetch collection for set:', err);
    } finally {
      setLoading(false);
    }
  }, [set.id]);

  useEffect(() => {
    if (email) {
      fetchCollectionForSet(email);
    }
  }, [email, fetchCollectionForSet]);

  const handleSaveEmail = () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@')) return;
    localStorage.setItem('pokeshows-email', trimmed);
    setEmail(trimmed);
  };

  const collected = collectedIds.size;
  const total = allCards.length || set.total;
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

  const missingCards = allCards.filter((c) => !collectedIds.has(c.id));

  const ebayBuyAllUrl = buildEbaySearchUrl({
    searchQuery: `pokemon ${set.name} cards lot`,
    customId: 'collection-buyall',
  });

  // No email prompt
  if (!email) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/collection"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> My Collection
        </Link>

        <div className="mx-auto max-w-md rounded-xl border border-border p-8 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Enter Your Email</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your email to track which {set.name} cards you own.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEmail();
            }}
            className="flex gap-2"
          >
            <Input
              type="email"
              placeholder="you@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Start</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/collection"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> My Collection
      </Link>

      {/* Set Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
        <div className="relative h-16 w-40 shrink-0">
          <Image
            src={set.logoUrl}
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
            {set.series} &middot; {set.printedTotal} cards
          </p>
        </div>
        <a
          href={ebayBuyAllUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          <Button className="gap-2 shrink-0">
            <ShoppingCart className="h-4 w-4" />
            Buy All Missing on eBay
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">Collection Progress</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {loading ? '...' : `${collected} / ${total} cards (${pct}%)`}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: loading ? '0%' : `${pct}%` }}
          />
        </div>
        {!loading && missingCards.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {missingCards.length} cards remaining to complete this set
          </p>
        )}
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2.5/3.5] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {allCards.map((card) => {
            const isCollected = collectedIds.has(card.id);
            const ebayCardUrl = buildEbaySearchUrl({
              searchQuery: `pokemon ${card.name} ${set.name}`,
              customId: 'collection-buy',
            });

            return (
              <div
                key={card.id}
                className={`group rounded-xl border p-3 transition-all duration-200 ${
                  isCollected
                    ? 'border-green-500/50 bg-green-500/5 hover:border-green-500/70'
                    : 'border-border opacity-60 hover:opacity-100 hover:border-primary/30'
                }`}
              >
                <div className="relative aspect-[2.5/3.5] mb-2 overflow-hidden rounded-lg">
                  <Image
                    src={card.imageSmall}
                    alt={`${card.name} #${card.number}`}
                    fill
                    className={`object-contain transition-transform duration-200 ${
                      isCollected ? 'group-hover:scale-105' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'
                    }`}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                  {isCollected && (
                    <div className="absolute top-1 right-1">
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-green-600">
                        Owned
                      </Badge>
                    </div>
                  )}
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
                </div>

                {!isCollected && (
                  <a
                    href={ebayCardUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Buy on eBay
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
