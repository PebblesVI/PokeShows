export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { US_STATE_NAMES } from '@/lib/constants';
import { getShowsByCity } from '@/db/queries/shows';
import { buildEbaySearchUrl } from '@/lib/ebay';
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

      {/* City Guide */}
      <section className="mt-16 pt-12 border-t border-border">
        <h2 className="text-xl font-semibold mb-6">
          Collector&apos;s Guide to {parsed.city}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-2">Getting There</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>Most venues in {parsed.city} have on-site parking, but arrive early for popular shows.</li>
              <li>Check the venue address on the show detail page for directions and parking info.</li>
              <li>Consider carpooling with other collectors to save on parking.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-2">Tips for {parsed.city} Shows</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>Bring cash &mdash; many vendors prefer it and some offer cash discounts.</li>
              <li>Arrive early for the best selection and any exclusive deals.</li>
              <li>Bring your own binders, sleeves, and top loaders to protect purchases.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-2">What to Expect</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>Vendors selling singles, sealed product, graded cards, and accessories.</li>
              <li>Opportunities to trade with other collectors and find rare cards.</li>
              <li>Some shows feature tournaments, raffles, and pack battles.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-2">Plan Ahead</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>Use our <Link href="/tools/budget" className="text-primary hover:underline">Budget Planner</Link> to manage your spending.</li>
              <li>Add cards to your <Link href="/wishlist" className="text-primary hover:underline">Wishlist</Link> so you know what to look for.</li>
              <li>Save shows to your <Link href="/favorites" className="text-primary hover:underline">Planner</Link> and set reminders.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Preparing for Your Trip */}
      <section className="mt-16 pt-12 border-t border-border">
        <h2 className="text-xl font-semibold mb-6">Preparing for Your Trip</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-3">Trip Checklist</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">&#10003;</span>
                Bring penny sleeves and top loaders
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">&#10003;</span>
                Set a budget before you go
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">&#10003;</span>
                Research prices on PokeShows before buying
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">&#10003;</span>
                Arrive early for the best selection
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-3">What to Bring</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Stock up on supplies before your next show:
            </p>
            <ul className="text-sm space-y-2.5">
              <li>
                <a
                  href={buildEbaySearchUrl({ searchQuery: 'pokemon card sleeves', customId: 'city-guide-sleeves' })}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
                >
                  Card Sleeves
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href={buildEbaySearchUrl({ searchQuery: 'card top loaders', customId: 'city-guide-toploaders' })}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
                >
                  Top Loaders
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href={buildEbaySearchUrl({ searchQuery: 'pokemon card binder', customId: 'city-guide-binder' })}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
                >
                  Card Binder
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-border">
              <Link
                href="/buy/essentials"
                className="text-sm font-medium text-primary hover:underline"
              >
                Browse all show day essentials &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

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
