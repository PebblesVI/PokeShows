'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { US_STATE_NAMES } from '@/lib/constants';
import { Search } from 'lucide-react';

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

  return (
    <div className="space-y-4 mb-10">
      <form onSubmit={handleSearch} className="flex gap-2">
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

      <div className="flex flex-col sm:flex-row gap-3">
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
      </div>
    </div>
  );
}
