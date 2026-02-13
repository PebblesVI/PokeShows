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
import { ShowFeed } from '@/components/shows/show-feed';
import { db } from '@/db';
import { vendorShowPresence, vendors } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Store } from 'lucide-react';

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

  // Fetch vendors attending this show
  const vendorPresences = await db.select()
    .from(vendorShowPresence)
    .where(eq(vendorShowPresence.showSlug, show.slug));

  let showVendors: (typeof vendors.$inferSelect)[] = [];
  if (vendorPresences.length > 0) {
    const vendorIds = vendorPresences.map(vp => vp.vendorId);
    const allVendors = await db.select().from(vendors);
    showVendors = allVendors.filter(v => vendorIds.includes(v.id));
    // Sort: featured first
    showVendors.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

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

            <div>
              <ShowFeed showSlug={show.slug} />
            </div>

            <div id="reviews">
              <ReviewList showSlug={show.slug} />
              <div className="mt-8">
                <ReviewForm showSlug={show.slug} />
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <ReminderForm showSlug={show.slug} showName={show.name} showDate={show.startDate} />

            {/* Vendors at This Show */}
            {showVendors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Vendors at This Show
                </h3>
                <div className="space-y-3">
                  {showVendors.map(vendor => (
                    <Link key={vendor.id} href={`/vendors/${vendor.slug}`}>
                      <div className={`rounded-lg border p-3 transition-all hover:shadow-sm ${vendor.isFeatured ? 'border-yellow-400/60 bg-yellow-50/50 dark:bg-yellow-900/10' : 'border-border hover:border-primary/30'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-sm">{vendor.name}</span>
                          {vendor.isFeatured && (
                            <Badge className="bg-yellow-400 text-yellow-900 text-[10px] shrink-0">
                              <Star className="h-2.5 w-2.5 mr-0.5" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        {vendor.city && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {vendor.city}, {vendor.state}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/vendors"
                  className="block text-center text-sm text-muted-foreground hover:text-primary hover:underline mt-3"
                >
                  View all vendors &rarr;
                </Link>
              </div>
            )}

            <div>
            <h3 className="text-lg font-semibold mb-4">Shop for the Show</h3>
            <div className="space-y-3">
              <AffiliateLink
                label="Pokemon Booster Boxes"
                searchQuery="pokemon booster box sealed"
                customId={`show-${show.slug}`}
              />
              <AffiliateLink
                label="Card Sleeves & Top Loaders"
                searchQuery="pokemon card sleeves top loaders"
                customId={`show-${show.slug}`}
              />
              <AffiliateLink
                label="Graded Pokemon Cards"
                searchQuery="PSA graded pokemon card"
                customId={`show-${show.slug}`}
              />
            </div>
            <Link
              href="/buy/essentials"
              className="block text-center text-sm font-medium text-primary hover:underline mt-4"
            >
              Show Day Essentials &rarr;
            </Link>
            <Link
              href="/buy"
              className="block text-center text-sm text-muted-foreground hover:text-primary hover:underline mt-2"
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
