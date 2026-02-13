import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { priceAlerts, cardPriceHistory, wishlistAlerts, cardOfTheDay, collectionCards } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { buildWishlistPriceDropEmailHtml, buildWishlistPriceDropEmailSubject } from '@/lib/email-templates/wishlist-price-drop';
import { buildCollectionValueAlertHtml, buildCollectionValueAlertSubject } from '@/lib/email-templates/collection-value-alert';
import { format, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const YELLOW = '#FFCB05';
const DARK_BG = '#1a1a2e';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildPriceAlertEmailHtml(cardName: string, currentPrice: number, targetPrice: number): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr><td align="center" style="padding: 32px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">
        <tr><td style="background-color: ${DARK_BG}; border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
          <div style="color: ${YELLOW}; font-size: 22px; font-weight: 800;">PokeShows</div>
          <div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">Price Drop Alert</div>
        </td></tr>
        <tr><td style="background-color: ${YELLOW}; padding: 16px 24px; text-align: center;">
          <div style="color: ${DARK_BG}; font-size: 18px; font-weight: 700;">Price Dropped!</div>
        </td></tr>
        <tr><td style="background-color: #ffffff; padding: 28px 24px;">
          <h2 style="margin: 0 0 12px; font-size: 20px; color: #1f2937;">${escapeHtml(cardName)}</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">
            Current price: <strong style="color: #059669;">$${currentPrice.toFixed(2)}</strong>
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">
            Your target: $${targetPrice.toFixed(2)}
          </p>
          <a href="${siteUrl}/card-of-the-day" style="display: inline-block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
            View Card
          </a>
        </td></tr>
        <tr><td style="padding: 20px 24px; text-align: center;">
          <div style="color: #9ca3af; font-size: 12px;">You set this alert on PokeShows. <a href="${siteUrl}" style="color: #9ca3af; text-decoration: underline;">Visit PokeShows</a></div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  try {
    const pendingAlerts = await db.select()
      .from(priceAlerts)
      .where(eq(priceAlerts.sent, false));

    let sent = 0;
    let skipped = 0;

    for (const alert of pendingAlerts) {
      try {
        // Get latest price for this card
        const [latestPrice] = await db.select()
          .from(cardPriceHistory)
          .where(eq(cardPriceHistory.pokemonTcgId, alert.pokemonTcgId))
          .orderBy(desc(cardPriceHistory.recordedDate))
          .limit(1);

        if (!latestPrice?.priceMarket && !latestPrice?.priceMid) {
          skipped++;
          continue;
        }

        const currentPrice = latestPrice.priceMarket ?? latestPrice.priceMid ?? 0;
        if (currentPrice > 0 && currentPrice <= alert.targetPrice) {
          const html = buildPriceAlertEmailHtml(alert.cardName, currentPrice, alert.targetPrice);

          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'PokeShows <reminders@pokeshows.com>',
              to: [alert.email],
              subject: `Price Drop: ${alert.cardName} is now $${currentPrice.toFixed(2)}`,
              html,
            }),
          });

          if (emailRes.ok) {
            await db.update(priceAlerts)
              .set({ sent: true })
              .where(eq(priceAlerts.id, alert.id));
            sent++;
          }
        }
      } catch (err) {
        console.error(`[check-prices] Error processing alert ${alert.id}:`, err);
      }
    }

    // Wishlist Price Drop Alerts
    let wishlistAlertsSent = 0;
    try {
      const allWishlistAlerts = await db.select().from(wishlistAlerts);
      const today = format(new Date(), 'yyyy-MM-dd');
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

      for (const alert of allWishlistAlerts) {
        // Don't check more than once per day
        if (alert.lastCheckedAt === today) continue;

        try {
          const cardIds: string[] = JSON.parse(alert.cardIds);
          const droppedCards: { name: string; previousPrice: number; currentPrice: number; dropPercent: number; tcgPlayerUrl?: string | null }[] = [];

          for (const cardId of cardIds) {
            // Get today's price
            const [todayPrice] = await db.select()
              .from(cardPriceHistory)
              .where(eq(cardPriceHistory.pokemonTcgId, cardId))
              .orderBy(desc(cardPriceHistory.recordedDate))
              .limit(1);

            if (!todayPrice?.priceMarket && !todayPrice?.priceMid) continue;
            const currentPrice = todayPrice.priceMarket ?? todayPrice.priceMid ?? 0;

            // Get previous price (yesterday or older)
            const [prevPrice] = await db.select()
              .from(cardPriceHistory)
              .where(and(
                eq(cardPriceHistory.pokemonTcgId, cardId),
                sql`${cardPriceHistory.recordedDate} < ${todayPrice.recordedDate}`,
              ))
              .orderBy(desc(cardPriceHistory.recordedDate))
              .limit(1);

            if (!prevPrice?.priceMarket && !prevPrice?.priceMid) continue;
            const previousPrice = prevPrice.priceMarket ?? prevPrice.priceMid ?? 0;

            if (previousPrice <= 0 || currentPrice >= previousPrice) continue;

            const dropPercent = ((previousPrice - currentPrice) / previousPrice) * 100;

            if (dropPercent >= alert.thresholdPercent) {
              // Get card name from cardOfTheDay table
              const cotdCard = await db.query.cardOfTheDay.findFirst({
                where: eq(cardOfTheDay.pokemonTcgId, cardId),
              });

              droppedCards.push({
                name: cotdCard?.cardName ?? cardId,
                previousPrice,
                currentPrice,
                dropPercent,
                tcgPlayerUrl: cotdCard?.tcgPlayerUrl,
              });
            }
          }

          if (droppedCards.length > 0) {
            const html = buildWishlistPriceDropEmailHtml(droppedCards);
            const subject = buildWishlistPriceDropEmailSubject(droppedCards);

            const emailRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: 'PokeShows <reminders@pokeshows.com>',
                to: [alert.email],
                subject,
                html,
              }),
            });

            if (emailRes.ok) wishlistAlertsSent++;
          }

          // Mark as checked today
          await db.update(wishlistAlerts)
            .set({ lastCheckedAt: today })
            .where(eq(wishlistAlerts.id, alert.id));
        } catch (err) {
          console.error(`[check-prices] Wishlist alert error for ${alert.email}:`, err);
        }
      }
    } catch (err) {
      console.error('[check-prices] Wishlist alerts batch error:', err);
    }

    // Collection Value Alerts (weekly, Mondays only)
    let collectionAlertsSent = 0;
    const isMonday = new Date().getDay() === 1;

    if (isMonday) {
      try {
        // Get all unique emails that have collection cards
        const allCollectionCards = await db.select().from(collectionCards);
        const emailCards: Record<string, typeof allCollectionCards> = {};

        for (const card of allCollectionCards) {
          if (!emailCards[card.email]) {
            emailCards[card.email] = [];
          }
          emailCards[card.email].push(card);
        }

        const today = format(new Date(), 'yyyy-MM-dd');
        const oneWeekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

        for (const [email, cards] of Object.entries(emailCards)) {
          try {
            let totalCurrentValue = 0;
            let totalPreviousValue = 0;
            const cardChanges: { name: string; currentPrice: number; previousPrice: number; change: number }[] = [];

            for (const card of cards) {
              // Get current price (latest)
              const [latestPrice] = await db.select()
                .from(cardPriceHistory)
                .where(eq(cardPriceHistory.pokemonTcgId, card.pokemonTcgId))
                .orderBy(desc(cardPriceHistory.recordedDate))
                .limit(1);

              if (!latestPrice?.priceMarket && !latestPrice?.priceMid) continue;
              const currentPrice = latestPrice.priceMarket ?? latestPrice.priceMid ?? 0;

              // Get price from ~7 days ago
              const [prevPrice] = await db.select()
                .from(cardPriceHistory)
                .where(and(
                  eq(cardPriceHistory.pokemonTcgId, card.pokemonTcgId),
                  sql`${cardPriceHistory.recordedDate} <= ${oneWeekAgo}`,
                ))
                .orderBy(desc(cardPriceHistory.recordedDate))
                .limit(1);

              const previousPrice = prevPrice?.priceMarket ?? prevPrice?.priceMid ?? currentPrice;

              totalCurrentValue += currentPrice;
              totalPreviousValue += previousPrice;

              if (previousPrice > 0) {
                cardChanges.push({
                  name: card.cardName,
                  currentPrice,
                  previousPrice,
                  change: currentPrice - previousPrice,
                });
              }
            }

            // Skip if no meaningful previous value to compare
            if (totalPreviousValue <= 0) continue;

            const changePercent = ((totalCurrentValue - totalPreviousValue) / totalPreviousValue) * 100;

            // Only send if change is >= 5% (up or down)
            if (Math.abs(changePercent) < 5) continue;

            // Sort for top gainers and losers
            const sorted = cardChanges.sort((a, b) => b.change - a.change);
            const topGainers = sorted
              .filter(c => c.change > 0)
              .slice(0, 5)
              .map(c => ({ name: c.name, change: c.change }));
            const topLosers = sorted
              .filter(c => c.change < 0)
              .slice(-5)
              .reverse()
              .map(c => ({ name: c.name, change: c.change }));

            const alertData = {
              totalValue: totalCurrentValue,
              previousValue: totalPreviousValue,
              changePercent,
              topGainers,
              topLosers,
            };

            const html = buildCollectionValueAlertHtml(alertData);
            const subject = buildCollectionValueAlertSubject(alertData);

            const emailRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: 'PokeShows <reminders@pokeshows.com>',
                to: [email],
                subject,
                html,
              }),
            });

            if (emailRes.ok) collectionAlertsSent++;
          } catch (err) {
            console.error(`[check-prices] Collection value alert error for ${email}:`, err);
          }
        }
      } catch (err) {
        console.error('[check-prices] Collection value alerts batch error:', err);
      }
    }

    return NextResponse.json({ success: true, total: pendingAlerts.length, sent, skipped, wishlistAlertsSent, collectionAlertsSent });
  } catch (error) {
    console.error('[check-prices] Cron failed:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
