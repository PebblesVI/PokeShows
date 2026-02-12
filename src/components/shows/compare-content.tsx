'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { X, Plus, Calendar, MapPin, DollarSign, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import type { Show } from '@/types/show';

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
  ];

  return (
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
  );
}
