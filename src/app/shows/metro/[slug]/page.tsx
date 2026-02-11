export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db';
import { shows } from '@/db/schema';
import { eq, and, gte, inArray, asc, sql } from 'drizzle-orm';
import { format } from 'date-fns';
import { getMetroBySlug, TOP_METROS } from '@/lib/metros';
import { US_STATE_NAMES } from '@/lib/constants';
import { ShowList } from '@/components/shows/show-list';
import { JsonLdItemList } from '@/components/seo/json-ld-item-list';

async function getMetroShows(cities: string[], states: string[]) {
  const today = format(new Date(), 'yyyy-MM-dd');
  return db
    .select()
    .from(shows)
    .where(
      and(
        eq(shows.isActive, true),
        inArray(shows.city, cities),
        inArray(shows.state, states),
        gte(shows.startDate, today)
      )
    )
    .orderBy(asc(shows.startDate));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const metro = getMetroBySlug(slug);
  if (!metro) return { title: 'Metro Area Not Found' };

  const ogImage = `/api/og?title=${encodeURIComponent(`Card Shows in ${metro.name} Area`)}&subtitle=${encodeURIComponent('Browse upcoming Pokemon & trading card events')}&type=metro`;

  return {
    title: `Pokemon Card Shows in ${metro.name} Area`,
    description: metro.description,
    openGraph: {
      title: `Pokemon Card Shows in ${metro.name} Area | PokeShows`,
      description: metro.description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Pokemon Card Shows in ${metro.name} Area | PokeShows`,
      images: [ogImage],
    },
  };
}

export default async function MetroShowsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const metro = getMetroBySlug(slug);
  if (!metro) notFound();

  const metroShows = await getMetroShows(metro.cities, metro.states);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const endOfMonthStr = format(endOfMonth, 'yyyy-MM-dd');
  const showsThisMonth = metroShows.filter(
    (s) => s.startDate <= endOfMonthStr
  );

  const nextShow = metroShows.length > 0 ? metroShows[0] : null;
  const nextShowDate = nextShow
    ? format(new Date(nextShow.startDate + 'T00:00:00'), 'MMMM d, yyyy')
    : null;

  const primaryStateName = US_STATE_NAMES[metro.state] || metro.state;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Are there Pokemon card shows in ${metro.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            metroShows.length > 0
              ? `Yes! There are currently ${metroShows.length} upcoming Pokemon and trading card shows scheduled in the ${metro.name} metro area. Shows take place across cities including ${metro.cities.slice(0, 5).join(', ')}.`
              : `There are no Pokemon card shows currently scheduled in the ${metro.name} area, but new events are added regularly. Check back soon or browse shows in ${primaryStateName}.`,
        },
      },
      {
        '@type': 'Question',
        name: `When is the next card show in ${metro.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: nextShow
            ? `The next card show in the ${metro.name} area is "${nextShow.name}" on ${nextShowDate}${nextShow.venueName ? ` at ${nextShow.venueName}` : ''} in ${nextShow.city}, ${nextShow.state}.`
            : `There are no card shows currently scheduled in ${metro.name}. New shows are added frequently, so check back soon.`,
        },
      },
      {
        '@type': 'Question',
        name: `How many card shows are in ${metro.name} this month?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            showsThisMonth.length > 0
              ? `There are ${showsThisMonth.length} card show${showsThisMonth.length !== 1 ? 's' : ''} scheduled in the ${metro.name} metro area this month. Browse our full list to find dates, venues, and details.`
              : `There are no card shows scheduled in ${metro.name} for the rest of this month. Check upcoming months for future events.`,
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Citation-friendly summary paragraph */}
      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        As of {format(now, 'MMMM yyyy')}, there are {metroShows.length} upcoming
        Pokemon and trading card shows in the {metro.name} metro area.
        {showsThisMonth.length > 0 &&
          ` ${showsThisMonth.length} show${showsThisMonth.length !== 1 ? 's are' : ' is'} happening this month.`}
        {nextShow &&
          ` The next event is "${nextShow.name}" on ${nextShowDate} in ${nextShow.city}, ${nextShow.state}.`}
      </p>

      {/* Hero section */}
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-2">
          Pokemon Card Shows in {metro.name} Area
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          {metroShows.length > 0
            ? `${metroShows.length} upcoming trading card show${metroShows.length !== 1 ? 's' : ''} across the ${metro.name} metro area.`
            : `No upcoming card shows found in the ${metro.name} area. Check back soon for new events.`}
        </p>
        <p className="text-muted-foreground max-w-3xl">{metro.description}</p>
      </section>

      {/* Show list */}
      <ShowList shows={metroShows} />

      {/* Cities in this area */}
      <section className="mt-20 pt-12 border-t border-border">
        <h2 className="text-xl font-semibold mb-6">
          Cities in the {metro.name} Area
        </h2>
        <div className="flex flex-wrap gap-2">
          {metro.cities.map((city) => {
            const citySlug = city.toLowerCase().replace(/\s+/g, '-');
            // For multi-state metros, use the primary state for the city link
            const cityState = metro.state.toLowerCase();
            return (
              <Link
                key={city}
                href={`/shows/city/${citySlug}-${cityState}`}
                className="text-sm px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors duration-200"
              >
                {city}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Link to state page */}
      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold mb-4">
          Browse by State
        </h2>
        <div className="flex flex-wrap gap-2">
          {metro.states.map((stateCode) => {
            const stateName = US_STATE_NAMES[stateCode] || stateCode;
            return (
              <Link
                key={stateCode}
                href={`/shows/state/${stateCode.toLowerCase()}`}
                className="text-sm px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10 transition-colors duration-200"
              >
                All shows in {stateName}
              </Link>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Can&apos;t find what you&apos;re looking for?{' '}
          <Link href="/shows" className="text-primary hover:underline">
            View all US shows
          </Link>
          .
        </p>
      </section>

      {/* Browse other metros */}
      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold mb-6">Other Metro Areas</h2>
        <div className="flex flex-wrap gap-2">
          {TOP_METROS.map((m) => (
            <Link
              key={m.slug}
              href={`/shows/metro/${m.slug}`}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                m.slug === slug
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {m.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Structured data */}
      <JsonLdItemList
        items={metroShows.map((s) => ({
          name: s.name,
          url: `${siteUrl}/shows/${s.slug}`,
        }))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
