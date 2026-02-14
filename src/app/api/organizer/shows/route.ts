import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { shows, showCheckins, showReviews } from '@/db/schema';
import { eq, like, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizerName = searchParams.get('organizerName');

    if (!organizerName) {
      return NextResponse.json(
        { error: 'organizerName query parameter is required' },
        { status: 400 },
      );
    }

    // Find shows where organizerName matches (case-insensitive with like)
    const matchingShows = await db
      .select({
        id: shows.id,
        slug: shows.slug,
        name: shows.name,
        city: shows.city,
        state: shows.state,
        startDate: shows.startDate,
        endDate: shows.endDate,
        isFeatured: shows.isFeatured,
      })
      .from(shows)
      .where(like(shows.organizerName, `%${organizerName}%`));

    // For each show, count checkins (going) and reviews
    const showsWithCounts = await Promise.all(
      matchingShows.map(async (show) => {
        const [goingResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(showCheckins)
          .where(eq(showCheckins.showSlug, show.slug));

        const [reviewResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(showReviews)
          .where(eq(showReviews.showSlug, show.slug));

        return {
          id: show.id,
          slug: show.slug,
          name: show.name,
          city: show.city,
          state: show.state,
          startDate: show.startDate,
          endDate: show.endDate,
          isFeatured: show.isFeatured,
          attendeeCount: Number(goingResult?.count ?? 0),
          goingCount: Number(goingResult?.count ?? 0),
          reviewCount: Number(reviewResult?.count ?? 0),
        };
      }),
    );

    return NextResponse.json({ shows: showsWithCounts });
  } catch (error) {
    console.error('[organizer/shows] Error fetching shows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizer shows' },
      { status: 500 },
    );
  }
}
