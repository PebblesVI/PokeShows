import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import {
  collectorAchievements,
  collectionCards,
  showCheckins,
  showReviews,
  priceAlerts,
  showFeedPosts,
} from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ACHIEVEMENTS } from '@/lib/achievements';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
  }

  try {
    const unlocked = await db
      .select({
        achievementId: collectorAchievements.achievementId,
        unlockedAt: collectorAchievements.unlockedAt,
      })
      .from(collectorAchievements)
      .where(eq(collectorAchievements.email, email));

    const unlockedMap = new Map(
      unlocked.map((u) => [u.achievementId, u.unlockedAt])
    );

    const achievements = ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id) ?? null,
    }));

    return NextResponse.json({
      achievements,
      unlockedCount: unlocked.length,
      totalCount: ACHIEVEMENTS.length,
    });
  } catch (error) {
    console.error('[achievements] Failed to fetch achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

const postSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
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

    const { email } = parsed.data;

    // Gather all counts in parallel
    const [
      [cardCount],
      [distinctSetCount],
      [showCount],
      [reviewCount],
      [tradeCount],
      [alertCount],
      [feedPostCount],
    ] = await Promise.all([
      db
        .select({ value: sql<number>`count(*)` })
        .from(collectionCards)
        .where(eq(collectionCards.email, email)),
      db
        .select({ value: sql<number>`count(distinct ${collectionCards.setId})` })
        .from(collectionCards)
        .where(eq(collectionCards.email, email)),
      db
        .select({ value: sql<number>`count(*)` })
        .from(showCheckins)
        .where(eq(showCheckins.email, email)),
      db
        .select({ value: sql<number>`count(*)` })
        .from(showReviews)
        .where(eq(showReviews.email, email)),
      db
        .select({ value: sql<number>`count(*)` })
        .from(collectionCards)
        .where(sql`${collectionCards.email} = ${email} AND ${collectionCards.forTrade} = 1`),
      db
        .select({ value: sql<number>`count(*)` })
        .from(priceAlerts)
        .where(eq(priceAlerts.email, email)),
      db
        .select({ value: sql<number>`count(*)` })
        .from(showFeedPosts)
        .where(eq(showFeedPosts.email, email)),
    ]);

    const cards = cardCount?.value ?? 0;
    const sets = distinctSetCount?.value ?? 0;
    const shows = showCount?.value ?? 0;
    const reviews = reviewCount?.value ?? 0;
    const trades = tradeCount?.value ?? 0;
    const alerts = alertCount?.value ?? 0;
    const posts = feedPostCount?.value ?? 0;

    // Define conditions for each achievement
    const conditions: Record<string, boolean> = {
      first_card: cards >= 1,
      collector_10: cards >= 10,
      collector_50: cards >= 50,
      collector_100: cards >= 100,
      multi_set: sets >= 5,
      first_show: shows >= 1,
      show_regular: shows >= 5,
      show_veteran: shows >= 20,
      first_review: reviews >= 1,
      trade_pioneer: trades >= 1,
      trade_master: trades >= 10,
      price_hunter: alerts >= 5,
      social_butterfly: posts >= 10,
    };

    // Get already unlocked
    const existing = await db
      .select({ achievementId: collectorAchievements.achievementId })
      .from(collectorAchievements)
      .where(eq(collectorAchievements.email, email));

    const existingSet = new Set(existing.map((e) => e.achievementId));

    // Find newly qualified achievements
    const newlyUnlocked: string[] = [];

    for (const [achievementId, met] of Object.entries(conditions)) {
      if (met && !existingSet.has(achievementId)) {
        try {
          await db.insert(collectorAchievements).values({
            email,
            achievementId,
          });
          newlyUnlocked.push(achievementId);
        } catch (err) {
          // INSERT OR IGNORE equivalent — unique constraint means already exists
          const message = err instanceof Error ? err.message : '';
          if (!message.includes('UNIQUE constraint')) {
            throw err;
          }
        }
      }
    }

    const newlyUnlockedDetails = ACHIEVEMENTS.filter((a) =>
      newlyUnlocked.includes(a.id)
    );

    return NextResponse.json({
      newlyUnlocked: newlyUnlockedDetails,
      total: existingSet.size + newlyUnlocked.length,
    });
  } catch (error) {
    console.error('[achievements] Failed to check achievements:', error);
    return NextResponse.json({ error: 'Failed to check achievements' }, { status: 500 });
  }
}
