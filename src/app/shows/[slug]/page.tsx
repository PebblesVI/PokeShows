import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getShowBySlug, getRelatedShows } from '@/db/queries/shows';
import { ShowDetailHero } from '@/components/shows/show-detail-hero';
import { ShowCountdown } from '@/components/shows/show-countdown';
import { ShowList } from '@/components/shows/show-list';
import Link from 'next/link';
import { AffiliateLink } from '@/components/shop/affiliate-link';
import { BookmarkButton } from '@/components/favorites/bookmark-button';
import { CalendarExportButton } from '@/components/shows/calendar-export-button';
import { ReminderForm } from '@/components/shows/reminder-form';
import { ShareButtons } from '@/components/ui/share-buttons';
import { JsonLdEvent } from '@/components/seo/json-ld-event';
import { GoingButton } from '@/components/shows/going-button';
import { ReviewForm } from '@/components/shows/review-form';
import { ReviewList } from '@/components/shows/review-list';
import { FollowOrganizerButton } from '@/components/shows/follow-organizer-button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const show = await getShowBySlug(slug);
  if (!show) return { title: 'Show Not Found' };

  const dateStr = format(new Date(show.startDate), 'MMMM d, yyyy');
  const title = `${show.name} - ${show.city}, ${show.state} | ${dateStr}`;
  const description = `${show.name} card show in ${show.city}, ${show.state} on ${dateStr}. Find event details, venue info, and shop for Pokemon cards.`;

  const ogImage = `/api/og?title=${encodeURIComponent(show.name)}&subtitle=${encodeURIComponent(`${show.city}, ${show.state} — ${dateStr}`)}&type=show`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/shows/${show.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ShowDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const show = await getShowBySlug(slug);
  if (!show) notFound();

  const relatedShows = await getRelatedShows(show.state, show.id, 4);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  const dateStr = format(new Date(show.startDate), 'MMMM d, yyyy');
  const shareUrl = `${siteUrl}/shows/${show.slug}`;
  const shareDescription = `Check out ${show.name} in ${show.city}, ${show.state} on ${dateStr}`;

  return (
    <>
      <JsonLdEvent show={show} />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <ShowCountdown startDate={show.startDate} startTime={show.startTime} />
          <div className="flex items-center gap-3">
            <GoingButton showSlug={show.slug} size="default" />
            <ShareButtons url={shareUrl} title={show.name} description={shareDescription} />
            <CalendarExportButton show={show} size="default" />
            <BookmarkButton slug={show.slug} size="default" />
          </div>
        </div>

        <ShowDetailHero show={show} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
          <div className="md:col-span-2 space-y-12">
            {show.description && (
              <>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                  <p className="text-muted-foreground leading-relaxed">{show.description}</p>
                </div>
              </>
            )}

            {show.organizerName && (
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Organized by <span className="font-medium text-foreground">{show.organizerName}</span></span>
                  <FollowOrganizerButton organizerName={show.organizerName} />
                </div>
              </div>
            )}

            <div id="reviews">
              <ReviewList showSlug={show.slug} />
              <div className="mt-8">
                <ReviewForm showSlug={show.slug} />
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <ReminderForm showSlug={show.slug} showName={show.name} showDate={show.startDate} />

            <div>
            <h3 className="text-lg font-semibold mb-4">Shop for the Show</h3>
            <div className="space-y-3">
              <AffiliateLink
                label="Pokemon Booster Boxes"
                searchQuery="pokemon booster box sealed"
                customId={`show-${show.slug}`}
              />
              <AffiliateLink
                label="Card Sleeves & Binders"
                searchQuery="pokemon card sleeves binder"
                customId={`show-${show.slug}`}
              />
              <AffiliateLink
                label="Graded Pokemon Cards"
                searchQuery="PSA graded pokemon card"
                customId={`show-${show.slug}`}
              />
            </div>
            <Link
              href="/buy"
              className="block text-center text-sm text-primary hover:underline mt-4"
            >
              Browse all Pokemon cards &rarr;
            </Link>
            </div>
          </aside>
        </div>

        {relatedShows.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border">
            <h2 className="text-xl font-semibold mb-6">
              More Shows in {show.stateFullName || show.state}
            </h2>
            <ShowList shows={relatedShows} />
          </section>
        )}
      </div>
    </>
  );
}
