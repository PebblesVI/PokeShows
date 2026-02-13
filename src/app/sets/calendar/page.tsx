import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ExternalLink, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getAllSets, type PokemonTcgSet } from '@/lib/pokemon-tcg';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { NotifyButton } from '@/components/sets/notify-button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pokemon TCG Set Release Calendar — Upcoming Sets',
  description: 'See all upcoming Pokemon TCG set releases, recently released sets, and the complete release history. Get notified when new sets drop.',
  openGraph: {
    title: 'Pokemon TCG Set Release Calendar | PokeShows',
    description: 'Upcoming Pokemon TCG set releases and complete release history.',
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function daysUntil(dateStr: string): number {
  const release = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((release.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function UpcomingSetCard({ set }: { set: PokemonTcgSet }) {
  const days = daysUntil(set.releaseDate);
  const ebayUrl = buildEbaySearchUrl({
    searchQuery: `pokemon ${set.name} booster box`,
    customId: `calendar-${set.id}`,
  });

  return (
    <div className="rounded-xl border border-border p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-28 shrink-0">
          <Image
            src={set.images.logo}
            alt={set.name}
            fill
            className="object-contain"
            sizes="112px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/buy/set/${set.id}`}
                className="text-sm font-semibold hover:text-primary transition-colors block truncate"
              >
                {set.name}
              </Link>
              <p className="text-xs text-muted-foreground">{set.series}</p>
            </div>
            <Badge variant="default" className="shrink-0">
              {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days`}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(set.releaseDate)}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {set.printedTotal} cards
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <NotifyButton
              setId={set.id}
              setName={set.name}
              releaseDate={set.releaseDate}
            />
            <a
              href={ebayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Pre-Order on eBay <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentSetCard({ set }: { set: PokemonTcgSet }) {
  const ebayUrl = buildEbaySearchUrl({
    searchQuery: `pokemon ${set.name} booster box`,
    customId: `calendar-${set.id}`,
  });

  return (
    <div className="rounded-xl border border-border p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative h-10 w-20 shrink-0">
          <Image
            src={set.images.logo}
            alt={set.name}
            fill
            className="object-contain"
            sizes="80px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/buy/set/${set.id}`}
            className="text-sm font-semibold hover:text-primary transition-colors block truncate"
          >
            {set.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {set.series} &middot; {formatDate(set.releaseDate)} &middot; {set.printedTotal} cards
          </p>
        </div>
        <a
          href={ebayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
        >
          Shop This Set <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function PastSetCard({ set }: { set: PokemonTcgSet }) {
  const ebayUrl = buildEbaySearchUrl({
    searchQuery: `pokemon ${set.name} booster box`,
    customId: `calendar-${set.id}`,
  });

  return (
    <Link key={set.id} href={`/buy/set/${set.id}`}>
      <div className="group rounded-xl border border-border p-4 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm text-center">
        <div className="relative h-10 mb-2">
          <Image
            src={set.images.logo}
            alt={set.name}
            fill
            className="object-contain"
            sizes="120px"
          />
        </div>
        <h3 className="text-xs font-semibold truncate group-hover:text-primary transition-colors duration-200">
          {set.name}
        </h3>
        <p className="text-[10px] text-muted-foreground">
          {set.printedTotal} cards &middot; {set.releaseDate?.slice(0, 4)}
        </p>
        <a
          href={ebayUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-primary hover:underline"
        >
          Shop <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </Link>
  );
}

export default async function SetCalendarPage() {
  const allSets = await getAllSets();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().slice(0, 10);

  // Categorize sets
  const upcoming: PokemonTcgSet[] = [];
  const recentlyReleased: PokemonTcgSet[] = [];
  const pastSets: PokemonTcgSet[] = [];

  for (const set of allSets) {
    if (!set.releaseDate) {
      pastSets.push(set);
      continue;
    }
    if (set.releaseDate > todayStr) {
      upcoming.push(set);
    } else if (set.releaseDate >= ninetyDaysAgoStr) {
      recentlyReleased.push(set);
    } else {
      pastSets.push(set);
    }
  }

  // Sort upcoming ascending by date (soonest first)
  upcoming.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  // Sort recently released descending (newest first)
  recentlyReleased.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));

  // Group past sets by year
  const pastByYear: Record<string, PokemonTcgSet[]> = {};
  for (const set of pastSets) {
    const year = set.releaseDate?.slice(0, 4) || 'Unknown';
    if (!pastByYear[year]) pastByYear[year] = [];
    pastByYear[year].push(set);
  }
  const yearOrder = Object.keys(pastByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Pokemon TCG Set Release Calendar</h1>
      <p className="text-muted-foreground mb-10">
        Track upcoming releases, browse recently released sets, and explore the complete Pokemon TCG history.
      </p>

      {/* Upcoming Sets */}
      {upcoming.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Upcoming Releases</h2>
            <Badge variant="outline">{upcoming.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((set) => (
              <UpcomingSetCard key={set.id} set={set} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Released */}
      {recentlyReleased.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Recently Released</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentlyReleased.map((set) => (
              <RecentSetCard key={set.id} set={set} />
            ))}
          </div>
        </section>
      )}

      {/* Past Sets by Year */}
      {yearOrder.length > 0 && (
        <section className="mt-16 pt-12 border-t border-border">
          <h2 className="text-2xl font-semibold mb-8">All Past Sets</h2>
          {yearOrder.map((year) => (
            <div key={year} className="mb-10">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">{year}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {pastByYear[year].map((set) => (
                  <PastSetCard key={set.id} set={set} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Bottom CTA */}
      <section className="mt-16 pt-12 border-t border-border text-center">
        <p className="text-muted-foreground mb-4">
          Looking for trending cards or price deals?
        </p>
        <Link
          href="/trending"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          View Trending Cards
        </Link>
      </section>
    </div>
  );
}
