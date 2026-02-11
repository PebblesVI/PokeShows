import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ShowList } from '@/components/shows/show-list';
import { ShowFilters } from '@/components/shows/show-filters';
import { ShowCalendarView } from '@/components/shows/show-calendar-view';
import { JsonLdItemList } from '@/components/seo/json-ld-item-list';
import { getFilteredShows } from '@/db/queries/shows';
import { US_STATE_NAMES } from '@/lib/constants';
import { db } from '@/db';
import { shows } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Pokemon Card Shows Directory',
  description: 'Browse all upcoming Pokemon and trading card shows in the United States. Filter by state, date, and event type.',
  openGraph: {
    title: 'Pokemon Card Shows Directory | PokeShows',
    description: 'Browse all upcoming Pokemon and trading card shows in the United States.',
  },
};

async function getShowCountsByState() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const results = await db.select({
    state: shows.state,
    count: sql<number>`count(*)`,
  })
    .from(shows)
    .where(and(eq(shows.isActive, true), gte(shows.startDate, today)))
    .groupBy(shows.state);

  const map: Record<string, number> = {};
  for (const r of results) {
    map[r.state] = r.count;
  }
  return map;
}

export default async function ShowsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; from?: string; to?: string; view?: string; q?: string }>;
}) {
  const params = await searchParams;
  const isFiltered = !!(params.state || params.from || params.to || params.q);

  const [filteredShows, stateCounts] = await Promise.all([
    getFilteredShows({
      state: params.state,
      fromDate: params.from,
      toDate: params.to,
      query: params.q,
    }),
    getShowCountsByState(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  const viewMode = params.view || 'list';

  // Sort states: those with shows first, then alphabetically
  const statesWithShows = Object.entries(US_STATE_NAMES)
    .filter(([code]) => (stateCounts[code] || 0) > 0)
    .sort((a, b) => (stateCounts[b[0]] || 0) - (stateCounts[a[0]] || 0));

  const statesWithout = Object.entries(US_STATE_NAMES)
    .filter(([code]) => !stateCounts[code])
    .sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Pokemon Card Shows</h1>
      <p className="text-muted-foreground mb-10">
        Find trading card shows, conventions, and tournaments across the United States.
      </p>

      {/* Browse by State */}
      {!isFiltered && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Browse by State</h2>
          {statesWithShows.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
              {statesWithShows.map(([code, name]) => (
                <Link
                  key={code}
                  href={`/shows/state/${code.toLowerCase()}`}
                  className="rounded-xl border border-border px-4 py-3 text-sm font-medium hover:border-primary/30 hover:text-primary transition-all duration-200 flex items-center justify-between"
                >
                  <span>{name}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {stateCounts[code]}
                  </span>
                </Link>
              ))}
            </div>
          )}
          {statesWithout.length > 0 && (
            <details className="text-sm">
              <summary className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                {statesWithout.length} states with no upcoming shows
              </summary>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-3">
                {statesWithout.map(([code, name]) => (
                  <Link
                    key={code}
                    href={`/shows/state/${code.toLowerCase()}`}
                    className="rounded-xl border border-border/50 px-3 py-2 text-xs text-muted-foreground hover:border-border hover:text-foreground transition-all duration-200"
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      <Suspense fallback={null}>
        <ShowFilters
          currentState={params.state}
          currentFrom={params.from}
          currentTo={params.to}
          currentView={viewMode}
          currentQuery={params.q}
        />
      </Suspense>

      {isFiltered && params.state && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Shows in {US_STATE_NAMES[params.state.toUpperCase()] || params.state}
          </h2>
        </div>
      )}

      {filteredShows.length > 0 ? (
        viewMode === 'calendar' ? (
          <ShowCalendarView shows={filteredShows} />
        ) : (
          <ShowList shows={filteredShows} />
        )
      ) : (
        <div className="text-center py-16 rounded-xl border border-border bg-muted/30">
          <p className="text-lg text-muted-foreground mb-2">No shows found</p>
          <p className="text-sm text-muted-foreground">
            {isFiltered
              ? 'Try adjusting your filters or browse by state above.'
              : 'Check back soon — we scrape new shows daily.'}
          </p>
        </div>
      )}

      <JsonLdItemList
        items={filteredShows.map(show => ({
          name: show.name,
          url: `${siteUrl}/shows/${show.slug}`,
        }))}
      />
    </div>
  );
}
