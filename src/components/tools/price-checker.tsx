'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PriceCheckResult {
  id: string;
  name: string;
  set: string;
  rarity: string | null;
  image: string;
  marketPrice: number | null;
  tcgPlayerUrl: string | null;
  ebayUrl: string;
}

export function PriceChecker() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PriceCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/price-check?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
        }
      } catch {
        // Silently handle fetch errors
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a card name (e.g. Charizard)"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching cards...
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map((card) => (
            <div
              key={card.id}
              className="rounded-xl border border-border p-4 flex gap-4 hover:border-primary/30 transition-all duration-200"
            >
              <div className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{card.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{card.set}</p>

                <div className="flex items-center gap-2 mt-1">
                  {card.rarity && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                      {card.rarity}
                    </Badge>
                  )}
                  {card.marketPrice != null && (
                    <span className="text-sm font-semibold text-primary">
                      ${card.marketPrice.toFixed(2)}
                    </span>
                  )}
                  {card.marketPrice == null && (
                    <span className="text-xs text-muted-foreground">No price data</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <a
                    href={card.ebayUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full hover:opacity-90 transition-opacity"
                  >
                    eBay
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {card.tcgPlayerUrl && (
                    <a
                      href={card.tcgPlayerUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-border text-xs font-medium rounded-full hover:border-primary/30 hover:text-primary transition-all duration-200"
                    >
                      TCGPlayer
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-border bg-muted/30">
          <p className="text-muted-foreground">
            No cards found for &quot;{query}&quot;. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
