export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { US_STATE_NAMES } from '@/lib/constants';
import { getShowsByCity } from '@/db/queries/shows';
import { ShowList } from '@/components/shows/show-list';
import { JsonLdItemList } from '@/components/seo/json-ld-item-list';

function parseCitySlug(slug: string): { city: string; state: string } | null {
  // Slug format: "houston-tx" or "san-antonio-tx"
  const parts = slug.split('-');
  if (parts.length < 2) return null;
  const state = parts[parts.length - 1].toUpperCase();
  if (!US_STATE_NAMES[state]) return null;
  const city = parts.slice(0, -1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return { city, state };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCitySlug(slug);
  if (!parsed) return { title: 'City Not Found' };

  const stateName = US_STATE_NAMES[parsed.state];

  return {
    title: `Pokemon Card Shows in ${parsed.city}, ${stateName}`,
    description: `Find upcoming Pokemon and trading card shows in ${parsed.city}, ${stateName}. Browse local conventions, tournaments, and card show events.`,
    openGraph: {
      title: `Pokemon Card Shows in ${parsed.city}, ${stateName} | PokeShows`,
      description: `Trading card shows and events in ${parsed.city}, ${stateName}.`,
    },
  };
}

export default async function CityShowsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseCitySlug(slug);
  if (!parsed) notFound();

  const stateName = US_STATE_NAMES[parsed.state];
  const shows = await getShowsByCity(parsed.city, parsed.state);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">
        Pokemon Card Shows in {parsed.city}, {stateName}
      </h1>
      <p className="text-muted-foreground mb-10">
        {shows.length > 0
          ? `${shows.length} upcoming trading card show${shows.length !== 1 ? 's' : ''} in ${parsed.city}, ${stateName}.`
          : `No upcoming card shows found in ${parsed.city}. Check nearby cities or browse all shows in ${stateName}.`}
      </p>

      <ShowList shows={shows} />

      <section className="mt-16 pt-12 border-t border-border">
        <h2 className="text-xl font-semibold mb-4">
          More Shows in{' '}
          <Link href={`/shows/state/${parsed.state.toLowerCase()}`} className="text-primary hover:underline">
            {stateName}
          </Link>
        </h2>
        <p className="text-sm text-muted-foreground">
          Browse all upcoming card shows across {stateName}, or{' '}
          <Link href="/shows" className="text-primary hover:underline">view all US shows</Link>.
        </p>
      </section>

      <JsonLdItemList
        items={shows.map(s => ({
          name: s.name,
          url: `${siteUrl}/shows/${s.slug}`,
        }))}
      />
    </div>
  );
}
