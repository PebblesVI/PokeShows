import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { US_STATE_NAMES } from '@/lib/constants';
import { getShowsByState, getAllCities } from '@/db/queries/shows';
import { format } from 'date-fns';
import { ShowList } from '@/components/shows/show-list';
import { JsonLdItemList } from '@/components/seo/json-ld-item-list';
import { JsonLdFaq } from '@/components/seo/json-ld-faq';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const stateUpper = state.toUpperCase();
  const stateName = US_STATE_NAMES[stateUpper];
  if (!stateName) return { title: 'State Not Found' };

  const ogImage = `/api/og?title=${encodeURIComponent(`Card Shows in ${stateName}`)}&subtitle=${encodeURIComponent('Browse upcoming Pokemon & trading card events')}&type=state`;

  return {
    title: `Pokemon Card Shows in ${stateName}`,
    description: `Find upcoming Pokemon and trading card shows in ${stateName}. Browse conventions, tournaments, and card show events happening in ${stateUpper}.`,
    openGraph: {
      title: `Pokemon Card Shows in ${stateName} | PokeShows`,
      description: `Find upcoming Pokemon and trading card shows in ${stateName}.`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Pokemon Card Shows in ${stateName} | PokeShows`,
      images: [ogImage],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function ShowsByStatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const stateUpper = state.toUpperCase();
  const stateName = US_STATE_NAMES[stateUpper];
  if (!stateName) notFound();

  const [shows, allCities] = await Promise.all([
    getShowsByState(stateUpper),
    getAllCities(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  const stateCities = allCities.filter(c => c.state === stateUpper);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">
        Pokemon Card Shows in {stateName}
      </h1>
      <p className="text-muted-foreground mb-10">
        Browse upcoming trading card shows, conventions, and tournaments in {stateName}.
        Find the next card show near you.
      </p>

      <ShowList shows={shows} />

      {stateCities.length > 0 && (
        <section className="mt-20 pt-12 border-t border-border">
          <h2 className="text-xl font-semibold mb-6">Cities in {stateName}</h2>
          <div className="flex flex-wrap gap-2">
            {stateCities.map(({ city }) => (
              <Link
                key={city}
                href={`/shows/city/${city.toLowerCase().replace(/\s+/g, '-')}-${stateUpper.toLowerCase()}`}
                className="text-sm px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors duration-200"
              >
                {city}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 pt-12 border-t border-border">
        <h2 className="text-xl font-semibold mb-6">Browse Other States</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(US_STATE_NAMES).map(([code, name]) => (
            <Link
              key={code}
              href={`/shows/state/${code.toLowerCase()}`}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                code === stateUpper
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {name}
            </Link>
          ))}
        </div>
      </section>

      <JsonLdItemList
        items={shows.map(s => ({
          name: s.name,
          url: `${siteUrl}/shows/${s.slug}`,
        }))}
      />

      <JsonLdFaq
        faqs={[
          {
            question: `Are there Pokemon card shows in ${stateName}?`,
            answer: shows.length > 0
              ? `Yes, there are currently ${shows.length} upcoming Pokemon and trading card shows scheduled in ${stateName}. Browse our listings to find shows near you with dates, venues, and admission details.`
              : `We currently don't have any upcoming Pokemon card shows listed for ${stateName}, but new shows are added regularly. Check back soon or subscribe to our newsletter for updates.`,
          },
          {
            question: `When is the next card show in ${stateName}?`,
            answer: shows.length > 0
              ? `The next card show in ${stateName} is "${shows[0].name}" on ${format(new Date(shows[0].startDate), 'MMMM d, yyyy')}${shows[0].city ? ` in ${shows[0].city}` : ''}.${shows[0].venueName ? ` It will be held at ${shows[0].venueName}.` : ''}`
              : `There are no upcoming card shows currently listed for ${stateName}. New shows are added frequently, so check back soon.`,
          },
          {
            question: `What types of card shows happen in ${stateName}?`,
            answer: `${stateName} hosts a variety of trading card events including Pokemon card conventions, trading card game tournaments, local card shows with vendors and dealers, collector meetups, and hobby expos featuring Pokemon and other TCG products.`,
          },
          {
            question: `How do I find card shows near me in ${stateName}?`,
            answer: `PokeShows maintains an up-to-date directory of Pokemon and trading card shows across ${stateName}. You can browse shows by city, check upcoming dates, and find details like venue locations, admission prices, and organizer information all in one place.`,
          },
        ]}
      />
    </div>
  );
}
