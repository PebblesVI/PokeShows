import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cardPriceHistory, cardOfTheDay } from '@/db/schema';
import { sql, asc } from 'drizzle-orm';
import { format, subDays } from 'date-fns';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { buildTcgPlayerAffiliateUrl, buildTcgPlayerSearchUrl } from '@/lib/tcgplayer-affiliate';

export const dynamic = 'force-dynamic';

interface DealCard {
  pokemonTcgId: string;
  cardName: string;
  setName: string;
  imageSmall: string;
  previousPrice: number;
  currentPrice: number;
  dropPercent: number;
  ebayUrl: string;
  tcgPlayerUrl: string;
}

export async function GET(_request: NextRequest) {
  try {
    const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd');

    // Query last 2 days of price data
    const recentPrices = await db
      .select({
        pokemonTcgId: cardPriceHistory.pokemonTcgId,
        priceMarket: cardPriceHistory.priceMarket,
        priceMid: cardPriceHistory.priceMid,
        recordedDate: cardPriceHistory.recordedDate,
      })
      .from(cardPriceHistory)
      .where(sql`${cardPriceHistory.recordedDate} >= ${twoDaysAgo}`)
      .orderBy(asc(cardPriceHistory.recordedDate));

    // Group by card: find earliest (previous) and latest (current) price
    const pricesByCard = new Map<string, { previous: number; current: number }>();
    for (const row of recentPrices) {
      const price = row.priceMarket ?? row.priceMid;
      if (!price || price <= 0) continue;

      const existing = pricesByCard.get(row.pokemonTcgId);
      if (!existing) {
        pricesByCard.set(row.pokemonTcgId, { previous: price, current: price });
      } else {
        existing.current = price;
      }
    }

    // Find cards that dropped 15%+
    const drops: Array<{
      pokemonTcgId: string;
      previousPrice: number;
      currentPrice: number;
      dropPercent: number;
    }> = [];

    for (const [pokemonTcgId, prices] of pricesByCard) {
      if (prices.previous <= 0 || prices.current >= prices.previous) continue;
      const dropPercent = ((prices.previous - prices.current) / prices.previous) * 100;
      if (dropPercent >= 15) {
        drops.push({
          pokemonTcgId,
          previousPrice: prices.previous,
          currentPrice: prices.current,
          dropPercent: Math.round(dropPercent * 10) / 10,
        });
      }
    }

    // Sort by biggest drop first, take top 8
    drops.sort((a, b) => b.dropPercent - a.dropPercent);
    const topDrops = drops.slice(0, 8);

    if (topDrops.length === 0) {
      return NextResponse.json({ deals: [] });
    }

    // Fetch card metadata
    const cardIds = topDrops.map((d) => d.pokemonTcgId);
    const metadata = await db
      .select({
        pokemonTcgId: cardOfTheDay.pokemonTcgId,
        cardName: cardOfTheDay.cardName,
        setName: cardOfTheDay.setName,
        imageSmall: cardOfTheDay.imageSmall,
        tcgPlayerUrl: cardOfTheDay.tcgPlayerUrl,
      })
      .from(cardOfTheDay)
      .where(
        sql`${cardOfTheDay.pokemonTcgId} IN (${sql.join(
          cardIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );

    const metaMap = new Map<
      string,
      { cardName: string; setName: string; imageSmall: string; tcgPlayerUrl: string | null }
    >();
    for (const card of metadata) {
      if (!metaMap.has(card.pokemonTcgId)) {
        metaMap.set(card.pokemonTcgId, {
          cardName: card.cardName,
          setName: card.setName,
          imageSmall: card.imageSmall,
          tcgPlayerUrl: card.tcgPlayerUrl,
        });
      }
    }

    // Build deal cards with affiliate URLs
    const deals: DealCard[] = topDrops
      .map((drop) => {
        const meta = metaMap.get(drop.pokemonTcgId);
        if (!meta) return null;

        const ebayUrl = buildEbaySearchUrl({
          searchQuery: `pokemon ${meta.cardName} ${meta.setName}`,
          customId: `deal-drop-${drop.pokemonTcgId}`,
        });

        const tcgPlayerUrl = meta.tcgPlayerUrl
          ? buildTcgPlayerAffiliateUrl(meta.tcgPlayerUrl)
          : buildTcgPlayerSearchUrl(meta.cardName);

        return {
          pokemonTcgId: drop.pokemonTcgId,
          cardName: meta.cardName,
          setName: meta.setName,
          imageSmall: meta.imageSmall,
          previousPrice: drop.previousPrice,
          currentPrice: drop.currentPrice,
          dropPercent: drop.dropPercent,
          ebayUrl,
          tcgPlayerUrl,
        };
      })
      .filter((d): d is DealCard => d !== null);

    return NextResponse.json({ deals });
  } catch (error) {
    console.error('[deals/dynamic] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}
