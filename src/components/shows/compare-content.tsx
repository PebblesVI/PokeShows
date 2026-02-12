'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { X, Plus, Calendar, MapPin, DollarSign, Tag, Users, ShoppingBag, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import type { Show } from '@/types/show';
import { buildEbaySearchUrl } from '@/lib/ebay';

const STORAGE_KEY = 'pokeshows-compare';

let cachedRaw: string | null = null;
let cachedParsed: string[] = [];

function getSnapshot(): string[] {
  if (typeof window === 'undefined') return cachedParsed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedParsed = raw ? JSON.parse(raw) : [];
    }
    return cachedParsed;
  } catch {
    return cachedParsed;
  }
}

function getServerSnapshot(): string[] {
  return cachedParsed;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener('compare-changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('compare-changed', callback);
  };
}

export function toggleCompare(slug: string) {
  if (typeof window === 'undefined') return;
  const current = getSnapshot();
  let next: string[];
  if (current.includes(slug)) {
    next = current.filter(s => s !== slug);
  } else {
    if (current.length >= 3) return; // Max 3
    next = [...current, slug];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('compare-changed'));
}

export function useCompare() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function CompareContent() {
  const compareSlugs = useCompare();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [goingCounts, setGoingCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (compareSlugs.length === 0) {
      setShows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/shows-by-slugs?slugs=${compareSlugs.join(',')}`)
      .then(r => r.json())
      .then(d => setShows(d.shows || []))
      .catch(() => setShows([]))
      .finally(() => setLoading(false));

    // Fetch going counts for each show
    for (const slug of compareSlugs) {
      fetch(`/api/shows/going?slug=${encodeURIComponent(slug)}`)
        .then(r => r.json())
        .then(d => setGoingCounts(prev => ({ ...prev, [slug]: d.count ?? 0 })))
        .catch(() => {});
    }
  }, [compareSlugs]);

  const removeShow = (slug: string) => {
    toggleCompare(slug);
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading comparison...</p>;
  }

  if (shows.length === 0) {
    return (
      <div className="text-center py-20">
        <Plus className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">No shows to compare</h2>
        <p className="text-muted-foreground mb-6">
          Add shows to compare by clicking the &quot;Compare&quot; button on any show card.
        </p>
        <Link
          href="/shows"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Browse Shows
        </Link>
      </div>
    );
  }

  const rows: { label: string; icon: React.ReactNode; getValue: (s: Show) => string }[] = [
    {
      label: 'Dates',
      icon: <Calendar className="h-4 w-4" />,
      getValue: (s) => {
        const start = format(new Date(s.startDate), 'MMM d, yyyy');
        return s.endDate ? `${start} - ${format(new Date(s.endDate), 'MMM d')}` : start;
      },
    },
    {
      label: 'Time',
      icon: <Calendar className="h-4 w-4" />,
      getValue: (s) => s.startTime || 'Not listed',
    },
    {
      label: 'Location',
      icon: <MapPin className="h-4 w-4" />,
      getValue: (s) => `${s.city}, ${s.state}`,
    },
    {
      label: 'Venue',
      icon: <MapPin className="h-4 w-4" />,
      getValue: (s) => s.venueName || 'Not listed',
    },
    {
      label: 'Admission',
      icon: <DollarSign className="h-4 w-4" />,
      getValue: (s) => s.admissionPrice || 'Not listed',
    },
    {
      label: 'Event Type',
      icon: <Tag className="h-4 w-4" />,
      getValue: (s) => s.eventType?.replace('_', ' ') || 'Card Show',
    },
    {
      label: 'Going',
      icon: <Users className="h-4 w-4" />,
      getValue: (s) => {
        const count = goingCounts[s.slug];
        return count != null ? `${count} attending` : '—';
      },
    },
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground w-32"></th>
              {shows.map((show) => (
                <th key={show.slug} className="p-3 text-left min-w-[200px]">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/shows/${show.slug}`} className="font-semibold hover:text-primary transition-colors">
                      {show.name}
                    </Link>
                    <button
                      onClick={() => removeShow(show.slug)}
                      className="p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                      aria-label="Remove from comparison"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <td className="p-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {row.icon}
                    {row.label}
                  </div>
                </td>
                {shows.map((show) => (
                  <td key={show.slug} className="p-3 text-sm">
                    {row.getValue(show)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commerce Bridge: Prep for each show */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Prep for Your Show</h3>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${shows.length}, 1fr)` }}>
          {shows.map((show) => {
            const showCustomId = `compare-${show.slug}`;
            return (
              <div key={show.slug} className="rounded-xl border border-border p-4 space-y-3">
                <p className="font-medium text-sm truncate">{show.name}</p>
                <div className="space-y-2">
                  <a
                    href={buildEbaySearchUrl({ searchQuery: 'pokemon booster box sealed', customId: showCustomId })}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center justify-between text-xs px-3 py-2 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <span>Booster Boxes</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                  <a
                    href={buildEbaySearchUrl({ searchQuery: 'pokemon card sleeves binder', customId: showCustomId })}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center justify-between text-xs px-3 py-2 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <span>Card Sleeves & Binders</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                  <a
                    href={buildEbaySearchUrl({ searchQuery: 'PSA graded pokemon card', customId: showCustomId })}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center justify-between text-xs px-3 py-2 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <span>Graded Cards</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </div>
                <Link
                  href={`/shows/${show.slug}`}
                  className="block text-center text-xs font-medium text-primary hover:underline pt-1"
                >
                  View Show Details &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
