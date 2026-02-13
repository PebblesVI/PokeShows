import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { collectorProfiles, collectionCards, cardPriceHistory } from '@/db/schema';
import { eq, desc, sql, count, countDistinct } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const profileSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  displayName: z.string().min(1, 'Display name is required').max(50),
  bio: z.string().max(500).optional(),
  favoriteSet: z.string().max(100).optional(),
});

function generateSlug(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 40);
}

function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 6);
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const slug = request.nextUrl.searchParams.get('slug');

  if (!email && !slug) {
    return NextResponse.json({ error: 'email or slug is required' }, { status: 400 });
  }

  try {
    let profile;
    if (slug) {
      profile = await db.query.collectorProfiles.findFirst({
        where: eq(collectorProfiles.slug, slug),
      });
    } else {
      profile = await db.query.collectorProfiles.findFirst({
        where: eq(collectorProfiles.email, email!),
      });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Calculate collection stats
    const [cardStats] = await db
      .select({
        totalCards: count(),
        forTradeCount: sql<number>`SUM(CASE WHEN ${collectionCards.forTrade} = 1 THEN 1 ELSE 0 END)`,
        setsCollected: countDistinct(collectionCards.setId),
      })
      .from(collectionCards)
      .where(eq(collectionCards.email, profile.email));

    // Calculate total value from price history
    const cards = await db
      .select({ pokemonTcgId: collectionCards.pokemonTcgId })
      .from(collectionCards)
      .where(eq(collectionCards.email, profile.email));

    let totalValue = 0;
    for (const card of cards) {
      const [latestPrice] = await db
        .select({
          priceMarket: cardPriceHistory.priceMarket,
          priceMid: cardPriceHistory.priceMid,
        })
        .from(cardPriceHistory)
        .where(eq(cardPriceHistory.pokemonTcgId, card.pokemonTcgId))
        .orderBy(desc(cardPriceHistory.recordedDate))
        .limit(1);

      if (latestPrice) {
        totalValue += latestPrice.priceMarket ?? latestPrice.priceMid ?? 0;
      }
    }

    return NextResponse.json({
      profile: {
        displayName: profile.displayName,
        slug: profile.slug,
        bio: profile.bio,
        favoriteSet: profile.favoriteSet,
        createdAt: profile.createdAt,
      },
      stats: {
        totalCards: cardStats?.totalCards ?? 0,
        totalValue: Math.round(totalValue * 100) / 100,
        forTradeCount: cardStats?.forTradeCount ?? 0,
        setsCollected: cardStats?.setsCollected ?? 0,
      },
    });
  } catch (error) {
    console.error('[collector-profile] Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, displayName, bio, favoriteSet } = parsed.data;

    // Check if profile already exists
    const existing = await db.query.collectorProfiles.findFirst({
      where: eq(collectorProfiles.email, email),
    });

    if (existing) {
      // Update existing profile
      await db
        .update(collectorProfiles)
        .set({
          displayName,
          bio: bio ?? null,
          favoriteSet: favoriteSet ?? null,
        })
        .where(eq(collectorProfiles.email, email));

      return NextResponse.json({ success: true, slug: existing.slug });
    }

    // Create new profile with unique slug
    let slug = generateSlug(displayName);

    // Check for slug conflict
    const slugConflict = await db.query.collectorProfiles.findFirst({
      where: eq(collectorProfiles.slug, slug),
    });

    if (slugConflict) {
      slug = `${slug}-${randomSuffix()}`;
    }

    await db.insert(collectorProfiles).values({
      email,
      displayName,
      slug,
      bio: bio ?? null,
      favoriteSet: favoriteSet ?? null,
    });

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('[collector-profile] Failed to create/update profile:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
