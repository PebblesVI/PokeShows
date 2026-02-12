'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trash2, ShoppingBag, ExternalLink, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useFavorites } from './favorites-provider';
import { ShowCountdown } from '@/components/shows/show-countdown';
import { CalendarExportButton } from '@/components/shows/calendar-export-button';
import { PreShowShoppingList } from '@/components/favorites/pre-show-shopping-list';
import { buildEbaySearchUrl } from '@/lib/ebay';
import type { Show } from '@/types/show';

const CHECKLIST_ITEMS = [
  'Cash',
  'Card binders',
  'Top loaders',
  'Penny sleeves',
  'Magnetics for high-value cards',
  'Snacks & water',
];

const GEAR_LINKS = [
  { label: 'Card Sleeves & Top Loaders', query: 'pokemon card sleeves top loaders' },
  { label: 'PSA Slab Cases', query: 'PSA graded card storage case' },
  { label: 'Magnetic One-Touch Holders', query: 'magnetic card holder 35pt one touch' },
  { label: 'Booster Boxes', query: 'pokemon booster box sealed' },
];

export function PlannerShowCard({ show }: { show: Show }) {
  const { toggleFavorite, getNote, setNote, getChecklist, toggleChecklistItem } = useFavorites();
  const note = getNote(show.slug);
  const checklist = getChecklist(show.slug);
  const startDate = new Date(show.startDate);
  const dateStr = format(startDate, 'MMM d, yyyy');

  return (
    <div className="rounded-xl border border-border p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/shows/${show.slug}`} className="font-semibold text-lg hover:text-primary transition-colors">
            {show.name}
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {dateStr}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {show.city}, {show.state}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <CalendarExportButton show={show} />
          <a
            href={`/shows/${show.slug}#reminder`}
            className="p-1.5 rounded-full hover:bg-accent/20 transition-colors"
            aria-label="Set reminder"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
          </a>
          <button
            onClick={() => toggleFavorite(show.slug)}
            className="p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label="Remove from planner"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Countdown */}
      <ShowCountdown startDate={show.startDate} startTime={show.startTime} />

      {/* Notes */}
      <div>
        <label className="text-sm font-medium mb-1 block">Notes</label>
        <textarea
          value={note}
          onChange={(e) => setNote(show.slug, e.target.value)}
          placeholder="Cards to look for, budget, vendors to visit..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Checklist */}
      <div>
        <label className="text-sm font-medium mb-2 block">Things to Bring</label>
        <div className="space-y-1.5">
          {CHECKLIST_ITEMS.map((item, i) => (
            <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={checklist[i] || false}
                onChange={() => toggleChecklistItem(show.slug, i)}
                className="rounded border-border"
              />
              <span className={checklist[i] ? 'line-through text-muted-foreground' : ''}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pre-Show Shopping List */}
      <PreShowShoppingList showSlug={show.slug} />

      {/* Gear Up section */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Gear Up for This Show</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {GEAR_LINKS.map(({ label, query }) => (
            <a
              key={label}
              href={buildEbaySearchUrl({ searchQuery: query, customId: `planner-gear-${show.slug}` })}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center justify-between gap-1 px-3 py-2 text-xs font-medium border border-border rounded-lg hover:border-primary/30 hover:text-primary transition-all duration-200"
            >
              <span className="truncate">{label}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
