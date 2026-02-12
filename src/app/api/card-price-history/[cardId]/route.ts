import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cardPriceHistory } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;

  const history = await db.select({
    date: cardPriceHistory.recordedDate,
    market: cardPriceHistory.priceMarket,
    low: cardPriceHistory.priceLow,
    high: cardPriceHistory.priceHigh,
  })
    .from(cardPriceHistory)
    .where(eq(cardPriceHistory.pokemonTcgId, cardId))
    .orderBy(asc(cardPriceHistory.recordedDate));

  return NextResponse.json({ history });
}
