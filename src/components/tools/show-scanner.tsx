'use client';

import { useState, useRef } from 'react';
import { Search, Loader2, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { buildTcgPlayerSearchUrl } from '@/lib/tcgplayer-affiliate';

interface CardResult {
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

interface HaulItem {
  id: string;
  name: string;
  setName: string;
  paidPrice: number;
  marketPrice: number | null;
}

export function ShowScanner() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CardResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [haul, setHaul] = useState<HaulItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('pokeshows-haul') || '[]');
    } catch {
      return [];
    }
  });
  const [buyingCard, setBuyingCard] = useState<CardResult | null>(null);
  const [buyPrice, setBuyPrice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const saveHaul = (items: HaulItem[]) => {
    setHaul(items);
    localStorage.setItem('pokeshows-haul', JSON.stringify(items));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/card-price-history/search?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.cards || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleAddToHaul = (card: CardResult) => {
    setBuyingCard(card);
    setBuyPrice('');
  };

  const confirmAdd = () => {
    if (!buyingCard || !buyPrice) return;
    const price = parseFloat(buyPrice);
    if (isNaN(price) || price < 0) return;

    const item: HaulItem = {
      id: buyingCard.id + '-' + Date.now(),
      name: buyingCard.name,
      setName: buyingCard.setName,
      paidPrice: price,
      marketPrice: buyingCard.priceMarket ?? buyingCard.priceMid,
    };

    saveHaul([...haul, item]);
    setBuyingCard(null);
    setBuyPrice('');
    inputRef.current?.focus();
  };

  const removeFromHaul = (id: string) => {
    saveHaul(haul.filter(h => h.id !== id));
  };

  const clearHaul = () => {
    saveHaul([]);
  };

  const haulTotal = haul.reduce((sum, h) => sum + h.paidPrice, 0);
  const haulMarketTotal = haul.reduce((sum, h) => sum + (h.marketPrice || 0), 0);

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search card name (e.g. Charizard ex)"
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={loading} size="lg" className="rounded-xl px-6">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
        </Button>
      </form>

      {/* Buy Price Modal */}
      {buyingCard && (
        <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
          <p className="text-sm font-medium mb-2">
            How much did you pay for <strong>{buyingCard.name}</strong>?
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-border bg-background pl-7 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && confirmAdd()}
              />
            </div>
            <Button onClick={confirmAdd} size="sm">Add</Button>
            <Button onClick={() => setBuyingCard(null)} variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''}</h3>
          {results.map(card => {
            const ebayUrl = buildEbaySearchUrl({
              searchQuery: `pokemon ${card.name} ${card.setName}`,
              customId: 'scanner',
            });
            const tcgPlayerUrl = buildTcgPlayerSearchUrl(`${card.name} ${card.setName}`);
            const displayPrice = card.priceMarket ?? card.priceMid;

            return (
              <div key={card.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{card.name}</p>
                    <p className="text-xs text-muted-foreground">{card.setName}</p>
                    {card.variant && (
                      <p className="text-xs text-muted-foreground capitalize">{card.variant}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {displayPrice != null ? (
                      <p className="text-lg font-bold text-primary">${displayPrice.toFixed(2)}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No price data</p>
                    )}
                  </div>
                </div>

                {/* Price range */}
                {(card.priceLow != null || card.priceHigh != null) && (
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    {card.priceLow != null && <span>Low: ${card.priceLow.toFixed(2)}</span>}
                    {card.priceMid != null && <span>Mid: ${card.priceMid.toFixed(2)}</span>}
                    {card.priceHigh != null && <span>High: ${card.priceHigh.toFixed(2)}</span>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => handleAddToHaul(card)}
                  >
                    <Plus className="h-3 w-3" /> I Bought This
                  </Button>
                  <a
                    href={ebayUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:border-primary/30 transition-colors"
                  >
                    eBay <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={tcgPlayerUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    TCGPlayer <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Haul Summary */}
      {haul.length > 0 && (
        <div className="rounded-xl border-2 border-primary/20 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Show Haul ({haul.length} card{haul.length !== 1 ? 's' : ''})</h3>
            <button onClick={clearHaul} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
              Clear All
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {haul.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <span className="truncate">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-1">({item.setName})</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-medium">${item.paidPrice.toFixed(2)}</span>
                  {item.marketPrice != null && (
                    <span className={`text-xs ${item.paidPrice <= item.marketPrice ? 'text-green-600' : 'text-red-500'}`}>
                      {item.paidPrice <= item.marketPrice ? 'Good deal!' : 'Over market'}
                    </span>
                  )}
                  <button onClick={() => removeFromHaul(item.id)} className="text-muted-foreground hover:text-destructive text-xs">
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-1">
            <div className="flex justify-between text-sm font-semibold">
              <span>Total Spent:</span>
              <span>${haulTotal.toFixed(2)}</span>
            </div>
            {haulMarketTotal > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Market Value:</span>
                <span>${haulMarketTotal.toFixed(2)}</span>
              </div>
            )}
            {haulMarketTotal > 0 && (
              <div className={`flex justify-between text-xs font-medium ${haulTotal <= haulMarketTotal ? 'text-green-600' : 'text-red-500'}`}>
                <span>{haulTotal <= haulMarketTotal ? 'Savings:' : 'Over market by:'}</span>
                <span>${Math.abs(haulMarketTotal - haulTotal).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Protection supplies */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Protect your haul:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Sleeves', query: 'pokemon card penny sleeves', customId: 'haul-sleeves' },
                { label: 'Top Loaders', query: 'ultra pro top loaders 35pt', customId: 'haul-toploaders' },
                { label: 'PSA Cases', query: 'PSA graded card storage case', customId: 'haul-psacase' },
              ].map(({ label, query, customId }) => (
                <a
                  key={label}
                  href={buildEbaySearchUrl({ searchQuery: query, customId })}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                >
                  {label} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
