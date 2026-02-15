import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cardPriceHistory, cardOfTheDay, wishlistAlerts } from '@/db/schema';
import { sql, asc, desc } from 'drizzle-orm';
import { format, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

interface TrendingCard {
  pokemonTcgId: string;
  cardName: string;
  setName: string;
  imageSmall: string;
  previousPrice: number;
  currentPrice: number;
  changePercent: number;
}

interface FeaturedCard {
  pokemonTcgId: string;
  cardName: string;
  setName: string;
  imageSmall: string;
  imageLarge: string;
  rarity: string | null;
  marketPrice: number;
  priceVariant: string | null;
}

interface WishlistedCard {
  pokemonTcgId: string;
  cardName: string;
  setName: string;
  imageSmall: string;
  currentPrice: number | null;
  wishlistCount: number;
}

export async function GET(_request: NextRequest) {
  try {
    const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd');

    // Query last 2 days of price data
    const recentPrices = await db.select({
      pokemonTcgId: cardPriceHistory.pokemonTcgId,
      priceMarket: cardPriceHistory.priceMarket,
      priceMid: cardPriceHistory.priceMid,
      recordedDate: cardPriceHistory.recordedDate,
    })
      .from(cardPriceHistory)
      .where(sql`${cardPriceHistory.recordedDate} >= ${twoDaysAgo}`)
      .orderBy(asc(cardPriceHistory.recordedDate));

    // Group by card: find earliest (previous) and latest (current) price
    const pricesByCard = new Map<string, { previous: number; current: number; dateCount: number }>();
    for (const row of recentPrices) {
      const price = row.priceMarket ?? row.priceMid;
      if (!price || price <= 0) continue;

      const existing = pricesByCard.get(row.pokemonTcgId);
      if (!existing) {
        pricesByCard.set(row.pokemonTcgId, { previous: price, current: price, dateCount: 1 });
      } else {
        // Later date overwrites current; if new date, increment count
        if (existing.current !== price) {
          existing.dateCount++;
        }
        existing.current = price;
      }
    }

    // Calculate % change for cards with price movement
    const movers: Array<{
      pokemonTcgId: string;
      previousPrice: number;
      currentPrice: number;
      changePercent: number;
    }> = [];

    for (const [pokemonTcgId, prices] of pricesByCard) {
      if (prices.previous === prices.current) continue;
      if (prices.previous === 0) continue;
      const changePercent = ((prices.current - prices.previous) / prices.previous) * 100;
      movers.push({
        pokemonTcgId,
        previousPrice: prices.previous,
        currentPrice: prices.current,
        changePercent,
      });
    }

    // Get card metadata from cardOfTheDay table
    const allCardIds = [...new Set(movers.map(m => m.pokemonTcgId))];
    const cardMetadataMap = new Map<string, { cardName: string; setName: string; imageSmall: string }>();

    if (allCardIds.length > 0) {
      const metadata = await db.select({
        pokemonTcgId: cardOfTheDay.pokemonTcgId,
        cardName: cardOfTheDay.cardName,
        setName: cardOfTheDay.setName,
        imageSmall: cardOfTheDay.imageSmall,
      })
        .from(cardOfTheDay)
        .where(sql`${cardOfTheDay.pokemonTcgId} IN (${sql.join(allCardIds.map(id => sql`${id}`), sql`, `)})`);

      for (const card of metadata) {
        if (!cardMetadataMap.has(card.pokemonTcgId)) {
          cardMetadataMap.set(card.pokemonTcgId, {
            cardName: card.cardName,
            setName: card.setName,
            imageSmall: card.imageSmall,
          });
        }
      }
    }

    // Build gainers and losers
    const sorted = [...movers].sort((a, b) => b.changePercent - a.changePercent);

    const gainers: TrendingCard[] = sorted
      .filter(m => m.changePercent > 0)
      .slice(0, 10)
      .map(m => {
        const meta = cardMetadataMap.get(m.pokemonTcgId);
        return {
          pokemonTcgId: m.pokemonTcgId,
          cardName: meta?.cardName ?? m.pokemonTcgId,
          setName: meta?.setName ?? '',
          imageSmall: meta?.imageSmall ?? '',
          previousPrice: m.previousPrice,
          currentPrice: m.currentPrice,
          changePercent: Math.round(m.changePercent * 10) / 10,
        };
      });

    const losers: TrendingCard[] = sorted
      .filter(m => m.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10)
      .map(m => {
        const meta = cardMetadataMap.get(m.pokemonTcgId);
        return {
          pokemonTcgId: m.pokemonTcgId,
          cardName: meta?.cardName ?? m.pokemonTcgId,
          setName: meta?.setName ?? '',
          imageSmall: meta?.imageSmall ?? '',
          previousPrice: m.previousPrice,
          currentPrice: m.currentPrice,
          changePercent: Math.round(m.changePercent * 10) / 10,
        };
      });

    // When no price movement data, show recently featured cards
    let featuredCards: FeaturedCard[] = [];
    if (gainers.length === 0 && losers.length === 0) {
      const recent = await db.select({
        pokemonTcgId: cardOfTheDay.pokemonTcgId,
        cardName: cardOfTheDay.cardName,
        setName: cardOfTheDay.setName,
        imageSmall: cardOfTheDay.imageSmall,
        imageLarge: cardOfTheDay.imageLarge,
        rarity: cardOfTheDay.rarity,
        tcgPlayerPrice: cardOfTheDay.tcgPlayerPrice,
        priceVariant: cardOfTheDay.priceVariant,
      })
        .from(cardOfTheDay)
        .where(sql`${cardOfTheDay.tcgPlayerPrice} IS NOT NULL`)
        .orderBy(desc(cardOfTheDay.featuredDate))
        .limit(20);

      featuredCards = recent.map(r => ({
        pokemonTcgId: r.pokemonTcgId,
        cardName: r.cardName,
        setName: r.setName,
        imageSmall: r.imageSmall,
        imageLarge: r.imageLarge,
        rarity: r.rarity,
        marketPrice: r.tcgPlayerPrice!,
        priceVariant: r.priceVariant,
      }));
    }

    // Most wishlisted: count occurrences across all wishlistAlerts cardIds
    const allWishlists = await db.select({
      cardIds: wishlistAlerts.cardIds,
    }).from(wishlistAlerts);

    const wishlistCounts = new Map<string, number>();
    for (const row of allWishlists) {
      try {
        const ids: string[] = JSON.parse(row.cardIds);
        for (const id of ids) {
          wishlistCounts.set(id, (wishlistCounts.get(id) || 0) + 1);
        }
      } catch {
        // skip malformed JSON
      }
    }

    // Sort by count descending, take top 10
    const topWishlisted = [...wishlistCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Fetch metadata for wishlisted cards
    const wishlistedIds = topWishlisted.map(([id]) => id);
    const wishlistMetaMap = new Map<string, { cardName: string; setName: string; imageSmall: string; price: number | null }>();

    if (wishlistedIds.length > 0) {
      const wishMeta = await db.select({
        pokemonTcgId: cardOfTheDay.pokemonTcgId,
        cardName: cardOfTheDay.cardName,
        setName: cardOfTheDay.setName,
        imageSmall: cardOfTheDay.imageSmall,
        priceMid: cardOfTheDay.priceMid,
      })
        .from(cardOfTheDay)
        .where(sql`${cardOfTheDay.pokemonTcgId} IN (${sql.join(wishlistedIds.map(id => sql`${id}`), sql`, `)})`);

      for (const card of wishMeta) {
        if (!wishlistMetaMap.has(card.pokemonTcgId)) {
          wishlistMetaMap.set(card.pokemonTcgId, {
            cardName: card.cardName,
            setName: card.setName,
            imageSmall: card.imageSmall,
            price: card.priceMid,
          });
        }
      }
    }

    const mostWishlisted: WishlistedCard[] = topWishlisted.map(([id, count]) => {
      const meta = wishlistMetaMap.get(id);
      return {
        pokemonTcgId: id,
        cardName: meta?.cardName ?? id,
        setName: meta?.setName ?? '',
        imageSmall: meta?.imageSmall ?? '',
        currentPrice: meta?.price ?? null,
        wishlistCount: count,
      };
    });

    return NextResponse.json({
      gainers,
      losers,
      featuredCards,
      mostWishlisted,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[trending] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 },
    );
  }
}
