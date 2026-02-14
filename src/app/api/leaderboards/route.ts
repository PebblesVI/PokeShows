import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  collectionCards,
  collectorProfiles,
  showCheckins,
  collectorAchievements,
} from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['collection_size', 'sets_collected', 'trades', 'shows_attended', 'achievements'] as const;
type LeaderboardType = (typeof VALID_TYPES)[number];

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') as LeaderboardType | null;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    let leaderboard: { rank: number; displayName: string; slug: string; value: number }[] = [];

    if (type === 'collection_size') {
      const rows = await db
        .select({
          email: collectionCards.email,
          value: sql<number>`count(*)`.as('value'),
        })
        .from(collectionCards)
        .groupBy(collectionCards.email)
        .orderBy(desc(sql`count(*)`))
        .limit(25);

      leaderboard = await attachProfiles(rows);
    }

    if (type === 'sets_collected') {
      const rows = await db
        .select({
          email: collectionCards.email,
          value: sql<number>`count(distinct ${collectionCards.setId})`.as('value'),
        })
        .from(collectionCards)
        .groupBy(collectionCards.email)
        .orderBy(desc(sql`count(distinct ${collectionCards.setId})`))
        .limit(25);

      leaderboard = await attachProfiles(rows);
    }

    if (type === 'trades') {
      const rows = await db
        .select({
          email: collectionCards.email,
          value: sql<number>`count(*)`.as('value'),
        })
        .from(collectionCards)
        .where(sql`${collectionCards.forTrade} = 1`)
        .groupBy(collectionCards.email)
        .orderBy(desc(sql`count(*)`))
        .limit(25);

      leaderboard = await attachProfiles(rows);
    }

    if (type === 'shows_attended') {
      const rows = await db
        .select({
          email: showCheckins.email,
          value: sql<number>`count(*)`.as('value'),
        })
        .from(showCheckins)
        .groupBy(showCheckins.email)
        .orderBy(desc(sql`count(*)`))
        .limit(25);

      leaderboard = await attachProfiles(rows);
    }

    if (type === 'achievements') {
      const rows = await db
        .select({
          email: collectorAchievements.email,
          value: sql<number>`count(*)`.as('value'),
        })
        .from(collectorAchievements)
        .groupBy(collectorAchievements.email)
        .orderBy(desc(sql`count(*)`))
        .limit(25);

      leaderboard = await attachProfiles(rows);
    }

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('[leaderboards] Failed to fetch leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

async function attachProfiles(
  rows: { email: string; value: number }[]
): Promise<{ rank: number; displayName: string; slug: string; value: number }[]> {
  if (rows.length === 0) return [];

  // Fetch all profiles for these emails
  const emails = rows.map((r) => r.email);
  const profiles = await db
    .select({
      email: collectorProfiles.email,
      displayName: collectorProfiles.displayName,
      slug: collectorProfiles.slug,
    })
    .from(collectorProfiles)
    .where(sql`${collectorProfiles.email} IN (${sql.join(emails.map((e) => sql`${e}`), sql`, `)})`);

  const profileMap = new Map(profiles.map((p) => [p.email, p]));

  return rows
    .map((row, index) => {
      const profile = profileMap.get(row.email);
      return {
        rank: index + 1,
        displayName: profile?.displayName ?? 'Anonymous Collector',
        slug: profile?.slug ?? '',
        value: row.value,
      };
    })
    .filter((entry) => entry.slug !== '');
}
