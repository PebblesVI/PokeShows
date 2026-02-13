import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { collectionCards, collectorProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get all cards marked for trade, most recent first
    const tradeCards = await db
      .select()
      .from(collectionCards)
      .where(eq(collectionCards.forTrade, true))
      .orderBy(desc(collectionCards.addedAt))
      .limit(50);

    // Get unique emails and fetch their profiles
    const uniqueEmails = [...new Set(tradeCards.map((c) => c.email))];
    const profiles: Record<string, { displayName: string; slug: string }> = {};

    for (const email of uniqueEmails) {
      const profile = await db.query.collectorProfiles.findFirst({
        where: eq(collectorProfiles.email, email),
      });
      if (profile) {
        profiles[email] = {
          displayName: profile.displayName,
          slug: profile.slug,
        };
      }
    }

    const trades = tradeCards
      .filter((card) => profiles[card.email]) // Only include cards from users with profiles
      .map((card) => ({
        pokemonTcgId: card.pokemonTcgId,
        cardName: card.cardName,
        setName: card.setName,
        imageSmall: card.imageSmall,
        rarity: card.rarity,
        collectorName: profiles[card.email].displayName,
        collectorSlug: profiles[card.email].slug,
      }));

    return NextResponse.json({ trades });
  } catch (error) {
    console.error('[trades/browse] Failed to fetch trades:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}
