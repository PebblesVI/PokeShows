'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowRightLeft,
  Search,
  Loader2,
  ExternalLink,
  User,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

interface BrowseTrade {
  pokemonTcgId: string;
  cardName: string;
  setName: string;
  imageSmall: string;
  rarity: string | null;
  collectorName: string;
  collectorSlug: string;
}

export function TradeBinder() {
  const [email, setEmail] = useState<string | null>(null);
  const [myCards, setMyCards] = useState<CollectionCard[]>([]);
  const [browseTrades, setBrowseTrades] = useState<BrowseTrade[]>([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingBrowse, setLoadingBrowse] = useState(true);
  const [togglingCard, setTogglingCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my-binder' | 'browse'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [interestSent, setInterestSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedEmail = localStorage.getItem('pokeshows-email');
    setEmail(storedEmail);
  }, []);

  const fetchMyCards = useCallback(async () => {
    if (!email) {
      setLoadingMy(false);
      return;
    }
    try {
      const res = await fetch(`/api/collection?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setMyCards(data.cards || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingMy(false);
    }
  }, [email]);

  const fetchBrowseTrades = useCallback(async () => {
    try {
      const res = await fetch('/api/trades/browse');
      if (res.ok) {
        const data = await res.json();
        setBrowseTrades(data.trades || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingBrowse(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCards();
    fetchBrowseTrades();
  }, [fetchMyCards, fetchBrowseTrades]);

  const toggleTradeStatus = async (card: CollectionCard) => {
    if (!email) return;
    setTogglingCard(card.pokemonTcgId);

    try {
      const res = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pokemonTcgId: card.pokemonTcgId,
          forTrade: !card.forTrade,
        }),
      });

      if (res.ok) {
        setMyCards((prev) =>
          prev.map((c) =>
            c.pokemonTcgId === card.pokemonTcgId
              ? { ...c, forTrade: !c.forTrade }
              : c,
          ),
        );
      }
    } catch {
      // Silently fail
    } finally {
      setTogglingCard(null);
    }
  };

  const handleInterest = (trade: BrowseTrade) => {
    setInterestSent((prev) => new Set(prev).add(trade.pokemonTcgId + trade.collectorSlug));
  };

  const myTradeCards = myCards.filter((c) => c.forTrade);
  const myNonTradeCards = myCards.filter((c) => !c.forTrade);

  const filteredBrowse = searchQuery
    ? browseTrades.filter(
        (t) =>
          t.cardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.setName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.collectorName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : browseTrades;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <ArrowRightLeft className="h-7 w-7" />
          Trade Binder
        </h1>
        <p className="text-muted-foreground mt-2">
          Offer your cards for trade and browse what other collectors have available.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'browse'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Browse Trades
        </button>
        <button
          onClick={() => setActiveTab('my-binder')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'my-binder'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My Trade Binder
          {myTradeCards.length > 0 && (
            <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {myTradeCards.length}
            </span>
          )}
        </button>
      </div>

      {/* Browse Trades Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by card, set, or collector..."
              className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {loadingBrowse ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBrowse.length === 0 ? (
            <div className="text-center py-16">
              <ArrowRightLeft className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No trades match your search.' : 'No cards available for trade yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrowse.map((trade, idx) => {
                const key = trade.pokemonTcgId + trade.collectorSlug;
                const alreadySent = interestSent.has(key);

                return (
                  <div
                    key={`${trade.pokemonTcgId}-${trade.collectorSlug}-${idx}`}
                    className="flex gap-4 rounded-xl border border-border p-4 hover:border-primary/30 transition-all"
                  >
                    <div className="w-16 shrink-0">
                      <img
                        src={trade.imageSmall}
                        alt={trade.cardName}
                        className="w-full rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{trade.cardName}</p>
                      <p className="text-xs text-muted-foreground truncate">{trade.setName}</p>
                      {trade.rarity && (
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {trade.rarity}
                        </Badge>
                      )}
                      <Link
                        href={`/collector/${trade.collectorSlug}`}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-2 transition-colors"
                      >
                        <User className="h-3 w-3" />
                        {trade.collectorName}
                      </Link>
                      <div className="mt-2">
                        {alreadySent ? (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Heart className="h-3 w-3" /> Interest sent!
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleInterest(trade)}
                            className="gap-1"
                          >
                            <Heart className="h-3 w-3" />
                            Interested
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Trade Binder Tab */}
      {activeTab === 'my-binder' && (
        <div className="space-y-8">
          {!email ? (
            <div className="text-center py-16 rounded-xl border border-border">
              <User className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">
                Sign in to manage your trade binder.
              </p>
              <p className="text-xs text-muted-foreground">
                Your email is stored locally in your browser.
              </p>
            </div>
          ) : loadingMy ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : myCards.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-border">
              <ArrowRightLeft className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Your collection is empty. Add cards to start trading!
              </p>
            </div>
          ) : (
            <>
              {/* Cards marked for trade */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-green-500" />
                  Offering for Trade
                  <span className="text-sm font-normal text-muted-foreground">
                    ({myTradeCards.length})
                  </span>
                </h2>
                {myTradeCards.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No cards marked for trade yet. Toggle the trade switch on your cards below.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {myTradeCards.map((card) => (
                      <TradeCard
                        key={card.pokemonTcgId}
                        card={card}
                        isToggling={togglingCard === card.pokemonTcgId}
                        onToggle={() => toggleTradeStatus(card)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Cards not for trade */}
              {myNonTradeCards.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Your Collection
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({myNonTradeCards.length} cards)
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {myNonTradeCards.map((card) => (
                      <TradeCard
                        key={card.pokemonTcgId}
                        card={card}
                        isToggling={togglingCard === card.pokemonTcgId}
                        onToggle={() => toggleTradeStatus(card)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TradeCard({
  card,
  isToggling,
  onToggle,
}: {
  card: CollectionCard;
  isToggling: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all hover:shadow-sm ${
        card.forTrade
          ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
          : 'border-border hover:border-primary/30'
      }`}
    >
      <div className="aspect-[2.5/3.5] relative bg-muted">
        <img
          src={card.imageSmall}
          alt={card.cardName}
          className="w-full h-full object-contain"
          loading="lazy"
        />
        {card.forTrade && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white text-[10px]">
              <ArrowRightLeft className="h-2.5 w-2.5 mr-0.5" />
              For Trade
            </Badge>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate">{card.cardName}</p>
        <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
        <div className="mt-2">
          <Button
            variant={card.forTrade ? 'default' : 'outline'}
            size="xs"
            onClick={onToggle}
            disabled={isToggling}
            className="w-full gap-1"
          >
            {isToggling ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ArrowRightLeft className="h-3 w-3" />
            )}
            {card.forTrade ? 'Remove from Trades' : 'Offer for Trade'}
          </Button>
        </div>
      </div>
    </div>
  );
}
