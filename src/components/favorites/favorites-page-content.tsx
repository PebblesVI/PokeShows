'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFavorites } from './favorites-provider';
import { ShowCard } from '@/components/shows/show-card';
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
    return <p className="text-muted-foreground">Loading your saved shows...</p>;
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground mb-4">
          You haven&apos;t saved any shows yet.
        </p>
        <Link href="/shows" className="text-primary hover:underline">
          Browse shows &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {shows.map(show => (
        <ShowCard key={show.id} show={show} />
      ))}
    </div>
  );
}
