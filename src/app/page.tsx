export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { HeroSection } from '@/components/home/hero-section';
import { UpcomingShows } from '@/components/home/upcoming-shows';
import { FeaturedPicks } from '@/components/home/featured-picks';
import { TrendingCards } from '@/components/home/trending-cards';
import { NewsletterSignup } from '@/components/home/newsletter-signup';
import { getCardOfTheDay, getCardArchive } from '@/db/queries/cards';
import { getUpcomingShows, getFeaturedShows } from '@/db/queries/shows';

export default async function HomePage() {
  const [cardOfDay, upcomingShows, recentCards, featuredShows] = await Promise.all([
    getCardOfTheDay(),
    getUpcomingShows({ limit: 6 }),
    getCardArchive(6),
    getFeaturedShows(4),
  ]);

  return (
    <>
      <HeroSection card={cardOfDay ?? null} />

      {featuredShows.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Featured Shows</h2>
          <UpcomingShows shows={featuredShows} />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Upcoming Shows</h2>
          <Link href="/shows" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
            View all &rarr;
          </Link>
        </div>
        <UpcomingShows shows={upcomingShows} />
      </section>

      {recentCards.length > 0 && (
        <section className="bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold">Trending Cards</h2>
              <Link href="/card-of-the-day" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
                See all &rarr;
              </Link>
            </div>
            <p className="text-muted-foreground text-sm mb-8">
              Recent featured cards — click any card to shop on eBay.
            </p>
            <TrendingCards cards={recentCards} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <NewsletterSignup />
      </section>

      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Shop Pokemon Cards</h2>
          <FeaturedPicks />
        </div>
      </section>
    </>
  );
}
