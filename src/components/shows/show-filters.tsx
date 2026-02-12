'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { US_STATE_NAMES } from '@/lib/constants';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { nextSaturday, isSaturday, isSunday, endOfMonth, format, addDays } from 'date-fns';

interface ShowFiltersProps {
  currentState?: string;
  currentFrom?: string;
  currentTo?: string;
  currentView?: string;
  currentQuery?: string;
}

export function ShowFilters({ currentState, currentFrom, currentTo, currentView, currentQuery }: ShowFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery || '');
  const hasActiveFilters = !!(currentState || currentFrom || currentTo);
  const [filtersOpen, setFiltersOpen] = useState(hasActiveFilters);

  const updateParams = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shows?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    updateParams('q', query || null);
  }, [query, updateParams]);

  const getWeekendDates = useCallback(() => {
    const now = new Date();
    let sat: Date;
    if (isSaturday(now)) {
      sat = now;
    } else if (isSunday(now)) {
      sat = nextSaturday(now);
    } else {
      sat = nextSaturday(now);
    }
    const sun = addDays(sat, 1);
    return { from: format(sat, 'yyyy-MM-dd'), to: format(sun, 'yyyy-MM-dd') };
  }, []);

  const getMonthDates = useCallback(() => {
    const now = new Date();
    return { from: format(now, 'yyyy-MM-dd'), to: format(endOfMonth(now), 'yyyy-MM-dd') };
  }, []);

  const setPreset = useCallback((preset: 'all' | 'weekend' | 'month') => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('from');
    params.delete('to');

    if (preset === 'weekend') {
      const { from, to } = getWeekendDates();
      params.set('from', from);
      params.set('to', to);
    } else if (preset === 'month') {
      const { from, to } = getMonthDates();
      params.set('from', from);
      params.set('to', to);
    }

    router.push(`/shows?${params.toString()}`);
  }, [router, searchParams, getWeekendDates, getMonthDates]);

  // Determine active preset
  const weekendDates = getWeekendDates();
  const monthDates = getMonthDates();
  const activePreset = currentFrom === weekendDates.from && currentTo === weekendDates.to
    ? 'weekend'
    : currentFrom === monthDates.from && currentTo === monthDates.to
      ? 'month'
      : !currentFrom && !currentTo
        ? 'all'
        : null;

  return (
    <div className="space-y-4 mb-10">
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'All Upcoming' },
          { key: 'weekend', label: 'This Weekend' },
          { key: 'month', label: 'This Month' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={activePreset === key ? 'default' : 'secondary'}
            size="sm"
            className="rounded-full"
            onClick={() => setPreset(key as 'all' | 'weekend' | 'month')}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search shows, cities, venues..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="rounded-full px-6">Search</Button>
        </form>
        <Button
          variant={filtersOpen ? 'default' : 'secondary'}
          size="sm"
          className="rounded-full gap-1.5 shrink-0"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          {filtersOpen ? <X className="h-3.5 w-3.5" /> : <SlidersHorizontal className="h-3.5 w-3.5" />}
          Filters
          {hasActiveFilters && !filtersOpen && (
            <span className="ml-1 inline-flex items-center justify-center h-4 w-4 text-[10px] rounded-full bg-primary-foreground text-primary font-bold">
              {[currentState, currentFrom, currentTo].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {filtersOpen && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-border bg-muted/30">
          <select
            value={currentState || ''}
            onChange={(e) => updateParams('state', e.target.value || null)}
            className="flex h-9 rounded-full border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All States</option>
            {Object.entries(US_STATE_NAMES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>

          <Input
            type="date"
            placeholder="From date"
            value={currentFrom || ''}
            onChange={(e) => updateParams('from', e.target.value || null)}
            className="w-auto rounded-full"
          />

          <Input
            type="date"
            placeholder="To date"
            value={currentTo || ''}
            onChange={(e) => updateParams('to', e.target.value || null)}
            className="w-auto rounded-full"
          />

          <div className="flex gap-1">
            <Button
              variant={currentView !== 'calendar' ? 'default' : 'secondary'}
              size="sm"
              className="rounded-full"
              onClick={() => updateParams('view', null)}
            >
              List
            </Button>
            <Button
              variant={currentView === 'calendar' ? 'default' : 'secondary'}
              size="sm"
              className="rounded-full"
              onClick={() => updateParams('view', 'calendar')}
            >
              Calendar
            </Button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('state');
                params.delete('from');
                params.delete('to');
                router.push(`/shows?${params.toString()}`);
              }}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
