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
  Search,
  Plus,
  Trash2,
  ArrowRightLeft,
  ExternalLink,
  Library,
  Layers,
  DollarSign,
  Receipt,
  PackageOpen,
  Mail,
} from 'lucide-react';

interface CollectionCard {
  id: number;
  email: string;
  pokemonTcgId: string;
  cardName: string;
  setName: string;
  setId: string;
  imageSmall: string;
  rarity: string | null;
  variant: string | null;
  pricePaid: number | null;
  forTrade: boolean;
  addedAt: string;
}

interface SearchResult {
  id: string;
  name: string;
  setName: string;
  imageSmall: string;
  priceLow: number | null;
  priceMid: number | null;
  priceHigh: number | null;
  priceMarket: number | null;
  variant: string | null;
}

interface CollectionValue {
  totalValue: number;
  totalPaid: number;
  cardCount: number;
  cards: { pokemonTcgId: string; cardName: string; currentPrice: number | null; pricePaid: number | null }[];
}

interface SetProgress {
  setId: string;
  setName: string;
  collected: number;
  total: number | null;
  cards: CollectionCard[];
}

export function CollectionPageContent() {
  const [email, setEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [valueData, setValueData] = useState<CollectionValue | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingCardId, setAddingCardId] = useState<string | null>(null);
  const [pricePaidInput, setPricePaidInput] = useState<Record<string, string>>({});

  // Set completion state
  const [setTotals, setSetTotals] = useState<Record<string, number>>({});

  // Read email from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('pokeshows-email');
    if (stored) {
      setEmail(stored);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch collection when email is available
  const fetchCollection = useCallback(async (userEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/collection?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.cards) {
        setCards(data.cards);
      }
    } catch (err) {
      console.error('Failed to fetch collection:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchValue = useCallback(async (userEmail: string) => {
    try {
      const res = await fetch(`/api/collection/value?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.totalValue != null) {
        setValueData(data);
      }
    } catch (err) {
      console.error('Failed to fetch collection value:', err);
    }
  }, []);

  useEffect(() => {
    if (email) {
      fetchCollection(email);
      fetchValue(email);
    }
  }, [email, fetchCollection, fetchValue]);

  // Fetch set totals for sets the user has cards from
  useEffect(() => {
    const uniqueSetIds = [...new Set(cards.map((c) => c.setId))];
    const missing = uniqueSetIds.filter((id) => !(id in setTotals));
    if (missing.length === 0) return;

    missing.forEach(async (setId) => {
      try {
        const res = await fetch(
          `https://api.pokemontcg.io/v2/sets/${setId}`,
          { next: { revalidate: 86400 } } as RequestInit,
        );
        const data = await res.json();
        if (data.data?.total) {
          setSetTotals((prev) => ({ ...prev, [setId]: data.data.total }));
        }
      } catch {
        // ignore fetch failures for set totals
      }
    });
  }, [cards, setTotals]);

  // Search cards
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/card-price-history/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.cards) {
          setSearchResults(data.cards);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSaveEmail = () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@')) return;
    localStorage.setItem('pokeshows-email', trimmed);
    setEmail(trimmed);
  };

  const handleAddCard = async (card: SearchResult) => {
    if (!email) return;
    setAddingCardId(card.id);

    const paid = pricePaidInput[card.id];
    const pricePaid = paid ? parseFloat(paid) : null;

    try {
      await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pokemonTcgId: card.id,
          cardName: card.name,
          setName: card.setName,
          setId: card.id.split('-')[0],
          imageSmall: card.imageSmall,
          rarity: null,
          variant: card.variant,
          pricePaid: isNaN(pricePaid as number) ? null : pricePaid,
        }),
      });

      await fetchCollection(email);
      await fetchValue(email);
      setSearchQuery('');
      setSearchResults([]);
      setPricePaidInput({});
    } catch (err) {
      console.error('Failed to add card:', err);
    } finally {
      setAddingCardId(null);
    }
  };

  const handleRemoveCard = async (pokemonTcgId: string) => {
    if (!email) return;
    try {
      await fetch('/api/collection', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pokemonTcgId }),
      });
      setCards((prev) => prev.filter((c) => c.pokemonTcgId !== pokemonTcgId));
      fetchValue(email);
    } catch (err) {
      console.error('Failed to remove card:', err);
    }
  };

  const handleToggleTrade = async (pokemonTcgId: string, currentForTrade: boolean) => {
    if (!email) return;
    try {
      await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pokemonTcgId, forTrade: !currentForTrade }),
      });
      setCards((prev) =>
        prev.map((c) =>
          c.pokemonTcgId === pokemonTcgId ? { ...c, forTrade: !currentForTrade } : c,
        ),
      );
    } catch (err) {
      console.error('Failed to toggle trade:', err);
    }
  };

  // Build set completion data
  const setProgress: SetProgress[] = (() => {
    const bySet: Record<string, CollectionCard[]> = {};
    for (const card of cards) {
      if (!bySet[card.setId]) bySet[card.setId] = [];
      bySet[card.setId].push(card);
    }
    return Object.entries(bySet).map(([setId, setCards]) => ({
      setId,
      setName: setCards[0].setName,
      collected: setCards.length,
      total: setTotals[setId] ?? null,
      cards: setCards,
    }));
  })();

  const uniqueSets = new Set(cards.map((c) => c.setId)).size;

  // Value lookup map
  const valueLookup: Record<string, number | null> = {};
  if (valueData) {
    for (const cv of valueData.cards) {
      valueLookup[cv.pokemonTcgId] = cv.currentPrice;
    }
  }

  // No email — show email prompt
  if (!email) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">My Collection</h1>
        <p className="text-muted-foreground mb-8">Track your Pokemon cards and complete your sets.</p>

        <div className="mx-auto max-w-md rounded-xl border border-border p-8 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Enter Your Email to Start</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We use your email to save your collection. No account needed.
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
      <h1 className="text-3xl font-bold mb-2">My Collection</h1>
      <p className="text-muted-foreground mb-8">
        Track your Pokemon cards, monitor value, and complete your sets.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Library className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Total Cards</span>
          </div>
          <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : cards.length}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Layers className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Unique Sets</span>
          </div>
          <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : uniqueSets}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Est. Value</span>
          </div>
          <p className="text-2xl font-bold">
            {valueData ? `$${valueData.totalValue.toFixed(2)}` : <Skeleton className="h-8 w-20" />}
          </p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Receipt className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Total Paid</span>
          </div>
          <p className="text-2xl font-bold">
            {valueData ? `$${valueData.totalPaid.toFixed(2)}` : <Skeleton className="h-8 w-20" />}
          </p>
        </div>
      </div>

      {/* Add Card Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add Cards
        </h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a card to add..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {searching && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

        {!searching && searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {searchResults.map((card) => {
              const alreadyOwned = cards.some((c) => c.pokemonTcgId === card.id);
              return (
                <div
                  key={card.id}
                  className="rounded-xl border border-border p-3 flex gap-3 transition-all duration-200 hover:border-primary/30"
                >
                  <div className="relative w-16 h-22 shrink-0">
                    <Image
                      src={card.imageSmall}
                      alt={card.name}
                      width={64}
                      height={88}
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{card.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
                    {card.priceMarket != null && (
                      <p className="text-xs font-medium text-primary mt-0.5">
                        ${card.priceMarket.toFixed(2)}
                      </p>
                    )}
                    <div className="mt-1.5">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price paid"
                        value={pricePaidInput[card.id] ?? ''}
                        onChange={(e) =>
                          setPricePaidInput((prev) => ({ ...prev, [card.id]: e.target.value }))
                        }
                        className="h-7 text-xs mb-1.5"
                      />
                      <Button
                        size="xs"
                        onClick={() => handleAddCard(card)}
                        disabled={addingCardId === card.id || alreadyOwned}
                        className="w-full"
                      >
                        {alreadyOwned ? 'In Collection' : addingCardId === card.id ? 'Adding...' : 'Add to Collection'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Collection Grid */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Library className="h-5 w-5" /> Your Cards
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2.5/3.5] rounded-xl" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border bg-muted/30">
            <PackageOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Your collection is empty</p>
            <p className="text-sm text-muted-foreground">
              Search for cards above to start building your collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cards.map((card) => {
              const currentPrice = valueLookup[card.pokemonTcgId];
              const ebayUrl = buildEbaySearchUrl({
                searchQuery: `pokemon ${card.cardName} ${card.setName}`,
                customId: 'collection-sell',
              });

              return (
                <div
                  key={card.pokemonTcgId}
                  className="group rounded-xl border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="relative aspect-[2.5/3.5] mb-2 overflow-hidden rounded-lg">
                    <Image
                      src={card.imageSmall}
                      alt={card.cardName}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                    {card.forTrade && (
                      <div className="absolute top-1 right-1">
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">
                          For Trade
                        </Badge>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-semibold truncate">{card.cardName}</h3>
                  <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
                  <div className="flex items-center justify-between mt-1">
                    {card.rarity && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                        {card.rarity}
                      </Badge>
                    )}
                    {currentPrice != null && (
                      <span className="text-xs font-medium text-primary">${currentPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      title={card.forTrade ? 'Remove from trade' : 'Mark for trade'}
                      onClick={() => handleToggleTrade(card.pokemonTcgId, card.forTrade)}
                    >
                      <ArrowRightLeft className="h-3 w-3" />
                    </Button>
                    <a
                      href={ebayUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      title="Find on eBay"
                    >
                      <Button variant="outline" size="icon-xs" asChild>
                        <span>
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      title="Remove from collection"
                      onClick={() => handleRemoveCard(card.pokemonTcgId)}
                      className="ml-auto text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Set Completion Section */}
      {setProgress.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5" /> Set Completion
          </h2>

          <div className="space-y-4">
            {setProgress.map((sp) => {
              const pct = sp.total ? Math.round((sp.collected / sp.total) * 100) : null;
              const ebayMissingUrl = buildEbaySearchUrl({
                searchQuery: `pokemon ${sp.setName} cards`,
                customId: 'collection-complete',
              });

              return (
                <div key={sp.setId} className="rounded-xl border border-border p-5 transition-all duration-200 hover:border-primary/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold">{sp.setName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {sp.collected} collected{sp.total ? ` / ${sp.total} total` : ''}
                        {pct != null && ` (${pct}%)`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/collection/set/${sp.setId}`}>
                        <Button variant="outline" size="sm">
                          View Set Progress
                        </Button>
                      </Link>
                      <Link href={`/buy/set/${sp.setId}`}>
                        <Button variant="outline" size="sm">
                          Complete This Set
                        </Button>
                      </Link>
                      <a
                        href={ebayMissingUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        <Button variant="outline" size="sm" className="gap-1.5">
                          Buy Missing on eBay
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {sp.total && (
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
