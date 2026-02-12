import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { showReviews } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

const postSchema = z.object({
  showSlug: z.string().min(1, 'Show slug is required'),
  email: z.string().email('Please enter a valid email address'),
  displayName: z.string().min(1, 'Display name is required').max(50),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    await db.insert(showReviews).values({
      showSlug: parsed.data.showSlug,
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      rating: parsed.data.rating,
      text: parsed.data.text || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('UNIQUE constraint')) {
      return NextResponse.json(
        { error: 'You have already reviewed this show' },
        { status: 409 },
      );
    }
    console.error('[reviews] Failed to create review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const reviews = await db.select({
    id: showReviews.id,
    displayName: showReviews.displayName,
    rating: showReviews.rating,
    text: showReviews.text,
    createdAt: showReviews.createdAt,
  })
    .from(showReviews)
    .where(eq(showReviews.showSlug, slug))
    .orderBy(desc(showReviews.createdAt))
    .limit(50);

  const [avgResult] = await db.select({
    avg: sql<number>`avg(${showReviews.rating})`,
    count: sql<number>`count(*)`,
  })
    .from(showReviews)
    .where(eq(showReviews.showSlug, slug));

  return NextResponse.json({
    reviews,
    averageRating: avgResult?.avg ? Math.round(avgResult.avg * 10) / 10 : null,
    totalReviews: avgResult?.count ?? 0,
  });
}
