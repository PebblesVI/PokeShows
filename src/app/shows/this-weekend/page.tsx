export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { ShowList } from '@/components/shows/show-list';
import { JsonLdItemList } from '@/components/seo/json-ld-item-list';
import { getWeekendShows } from '@/db/queries/shows';
import { format, nextSaturday, isSaturday, isSunday } from 'date-fns';

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date();
  let saturday: Date;
  if (isSaturday(now)) {
    saturday = now;
  } else if (isSunday(now)) {
    saturday = nextSaturday(now);
  } else {
    saturday = nextSaturday(now);
  }
  const weekendStr = format(saturday, 'MMMM d, yyyy');

  return {
    title: `Pokemon Card Shows This Weekend — ${weekendStr}`,
    description: `Find Pokemon and trading card shows happening this weekend (${weekendStr}) across the United States. Browse upcoming events near you.`,
    openGraph: {
      title: `Card Shows This Weekend — ${weekendStr} | PokeShows`,
      description: `Trading card shows happening this weekend across the US.`,
    },
  };
}

export default async function ThisWeekendPage() {
  const shows = await getWeekendShows();
  const now = new Date();
  let saturday: Date;
  if (isSaturday(now)) {
    saturday = now;
  } else if (isSunday(now)) {
    saturday = nextSaturday(now);
  } else {
    saturday = nextSaturday(now);
  }
  const weekendStr = format(saturday, 'MMMM d, yyyy');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  // Group shows by state
  const showsByState: Record<string, typeof shows> = {};
  for (const show of shows) {
    if (!showsByState[show.state]) {
      showsByState[show.state] = [];
    }
    showsByState[show.state].push(show);
  }

  const stateCount = Object.keys(showsByState).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Card Shows This Weekend</h1>
      <p className="text-muted-foreground mb-10">
        {shows.length > 0
          ? `${shows.length} show${shows.length !== 1 ? 's' : ''} across ${stateCount} state${stateCount !== 1 ? 's' : ''} — weekend of ${weekendStr}`
          : `No shows found for the weekend of ${weekendStr}. Check back later!`}
      </p>

      {shows.length > 0 && (
        <ShowList shows={shows} />
      )}

      <JsonLdItemList
        items={shows.map(show => ({
          name: show.name,
          url: `${siteUrl}/shows/${show.slug}`,
        }))}
      />
    </div>
  );
}
