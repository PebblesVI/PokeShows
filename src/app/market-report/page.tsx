export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { db } from '@/db';
import { cardPriceHistory, cardOfTheDay } from '@/db/schema';
import { sql, desc, asc, eq } from 'drizzle-orm';
import { format, subDays } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Monthly Market Report',
  description: 'See which Pokemon cards gained or lost the most value this month. Top movers and price trends.',
};

interface CardMover {
  pokemonTcgId: string;
  cardName: string | null;
  oldPrice: number;
  newPrice: number;
  change: number;
  changePercent: number;
}

async function getTopMovers(): Promise<{ gainers: CardMover[]; losers: CardMover[] }> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  // Get cards with price history from 30 days ago and today
  const recentPrices = await db.select({
    pokemonTcgId: cardPriceHistory.pokemonTcgId,
    priceMarket: cardPriceHistory.priceMarket,
    recordedDate: cardPriceHistory.recordedDate,
  })
    .from(cardPriceHistory)
    .where(sql`${cardPriceHistory.recordedDate} >= ${thirtyDaysAgo}`)
    .orderBy(asc(cardPriceHistory.recordedDate));

  // Group prices by card
  const pricesByCard = new Map<string, { earliest: number; latest: number }>();
  for (const row of recentPrices) {
    if (!row.priceMarket) continue;
    const existing = pricesByCard.get(row.pokemonTcgId);
    if (!existing) {
      pricesByCard.set(row.pokemonTcgId, { earliest: row.priceMarket, latest: row.priceMarket });
    } else {
      existing.latest = row.priceMarket;
    }
  }

  // Calculate changes
  const movers: CardMover[] = [];
  for (const [pokemonTcgId, prices] of pricesByCard) {
    if (prices.earliest === 0) continue;
    const change = prices.latest - prices.earliest;
    const changePercent = (change / prices.earliest) * 100;
    movers.push({
      pokemonTcgId,
      cardName: null,
      oldPrice: prices.earliest,
      newPrice: prices.latest,
      change,
      changePercent,
    });
  }

  // Look up card names from cardOfTheDay table
  const cardIds = movers.map(m => m.pokemonTcgId);
  if (cardIds.length > 0) {
    const cards = await db.select({
      pokemonTcgId: cardOfTheDay.pokemonTcgId,
      cardName: cardOfTheDay.cardName,
    })
      .from(cardOfTheDay)
      .where(sql`${cardOfTheDay.pokemonTcgId} IN (${sql.join(cardIds.map(id => sql`${id}`), sql`, `)})`);

    const nameMap = new Map(cards.map(c => [c.pokemonTcgId, c.cardName]));
    for (const mover of movers) {
      mover.cardName = nameMap.get(mover.pokemonTcgId) ?? mover.pokemonTcgId;
    }
  }

  // Sort and pick top 10
  const sorted = [...movers].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter(m => m.change > 0).slice(0, 10);
  const losers = sorted.filter(m => m.change < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 10);

  return { gainers, losers };
}

function PriceChangeIcon({ change }: { change: number }) {
  if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
  if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function MoverTable({ title, movers, type }: { title: string; movers: CardMover[]; type: 'gain' | 'loss' }) {
  const colorClass = type === 'gain'
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  if (movers.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-muted-foreground">Not enough price data yet. Check back after more cards have been tracked.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground p-3">#</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Card</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-3">30d Ago</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-3">Now</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-3">Change</th>
            </tr>
          </thead>
          <tbody>
            {movers.map((mover, i) => (
              <tr key={mover.pokemonTcgId} className="border-b border-border last:border-0">
                <td className="p-3 text-sm text-muted-foreground">{i + 1}</td>
                <td className="p-3 text-sm font-medium">{mover.cardName || mover.pokemonTcgId}</td>
                <td className="p-3 text-sm text-right text-muted-foreground">${mover.oldPrice.toFixed(2)}</td>
                <td className="p-3 text-sm text-right font-medium">${mover.newPrice.toFixed(2)}</td>
                <td className={`p-3 text-sm text-right font-semibold ${colorClass}`}>
                  <div className="flex items-center justify-end gap-1">
                    <PriceChangeIcon change={mover.change} />
                    {mover.changePercent > 0 ? '+' : ''}{mover.changePercent.toFixed(1)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function MarketReportPage() {
  const { gainers, losers } = await getTopMovers();
  const reportDate = format(new Date(), 'MMMM yyyy');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Monthly Market Report</h1>
      <p className="text-muted-foreground mb-10">
        Pokemon card price trends for {reportDate}. Based on tracked card price history.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <MoverTable title="Top Gainers" movers={gainers} type="gain" />
        <MoverTable title="Top Decliners" movers={losers} type="loss" />
      </div>

      <section className="mt-16 pt-12 border-t border-border text-center">
        <p className="text-muted-foreground mb-4">Want to track specific cards?</p>
        <Link
          href="/card-of-the-day"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Explore Cards
        </Link>
      </section>
    </div>
  );
}
