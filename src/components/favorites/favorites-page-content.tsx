'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { useFavorites } from './favorites-provider';
import { PlannerShowCard } from './planner-show-card';
import { buildEbaySearchUrl } from '@/lib/ebay';
import type { Show } from '@/types/show';

export function FavoritesPageContent() {
  const { favorites } = useFavorites();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setShows([]);
      setLoading(false);
      return;
    }

    async function fetchShows() {
      try {
        const res = await fetch(`/api/shows-by-slugs?slugs=${favorites.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          setShows(data.shows);
        }
      } catch {
        // Silently fail
      }
      setLoading(false);
    }

    fetchShows();
  }, [favorites]);

  if (loading) {
    return <p className="text-muted-foreground">Loading your planned shows...</p>;
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground mb-4">
          No shows planned yet.
        </p>
        <Link href="/shows" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity">
          Browse Shows
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Gear Up Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Gear Up for Your Shows</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Get everything you need before your next card show.</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Card Sleeves', query: 'pokemon card sleeves' },
            { label: 'Binders', query: 'pokemon card binder' },
            { label: 'Top Loaders', query: 'card top loaders' },
            { label: 'Booster Boxes', query: 'pokemon booster box sealed' },
          ].map(({ label, query }) => (
            <a
              key={label}
              href={buildEbaySearchUrl({ searchQuery: query, customId: 'planner-banner' })}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              {label} <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {shows.map(show => (
          <PlannerShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  );
}
