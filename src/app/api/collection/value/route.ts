import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { collectionCards, cardPriceHistory } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const cards = await db
      .select()
      .from(collectionCards)
      .where(eq(collectionCards.email, email));

    let totalValue = 0;
    let totalPaid = 0;

    const cardValues = await Promise.all(
      cards.map(async (card) => {
        const priceRows = await db
          .select({
            priceMarket: cardPriceHistory.priceMarket,
            priceMid: cardPriceHistory.priceMid,
          })
          .from(cardPriceHistory)
          .where(eq(cardPriceHistory.pokemonTcgId, card.pokemonTcgId))
          .orderBy(desc(cardPriceHistory.recordedDate))
          .limit(1);

        const latestPrice = priceRows[0];
        const currentPrice = latestPrice?.priceMarket ?? latestPrice?.priceMid ?? null;

        if (currentPrice != null) {
          totalValue += currentPrice;
        }
        if (card.pricePaid != null) {
          totalPaid += card.pricePaid;
        }

        return {
          pokemonTcgId: card.pokemonTcgId,
          cardName: card.cardName,
          currentPrice,
          pricePaid: card.pricePaid,
        };
      }),
    );

    return NextResponse.json({
      totalValue: Math.round(totalValue * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      cardCount: cards.length,
      cards: cardValues,
    });
  } catch (error) {
    console.error('[collection/value] Failed to calculate value:', error);
    return NextResponse.json({ error: 'Failed to calculate collection value' }, { status: 500 });
  }
}
