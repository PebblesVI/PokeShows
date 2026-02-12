import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ebayListings, cardOfTheDay, dealSubscribers } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { buildEbaySearchUrl } from '@/lib/ebay';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const YELLOW = '#FFCB05';
const DARK_BG = '#1a1a2e';
const TEXT_SECONDARY = '#6b7280';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface DealCard {
  cardName: string;
  setName: string;
  imageSmall: string;
  tcgPlayerPrice: number;
  ebayPrice: number;
  discountPct: number;
  searchQuery: string;
}

function buildDealEmailHtml(deal: DealCard): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  const buyUrl = buildEbaySearchUrl({ searchQuery: deal.searchQuery, customId: 'deal-of-the-day' });
  const savePct = Math.round(deal.discountPct);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr><td align="center" style="padding: 32px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">

        <!-- Header -->
        <tr><td style="background-color: ${DARK_BG}; border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
          <div style="border-top: 4px solid ${YELLOW}; width: 60px; margin: 0 auto 16px;"></div>
          <div style="color: ${YELLOW}; font-size: 22px; font-weight: 800;">PokeShows</div>
          <div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">Deal of the Day</div>
        </td></tr>

        <!-- Title bar -->
        <tr><td style="background-color: ${YELLOW}; padding: 14px 24px; text-align: center;">
          <div style="color: ${DARK_BG}; font-size: 18px; font-weight: 700;">Today&apos;s Best Card Deal</div>
        </td></tr>

        <!-- Deal content -->
        <tr><td style="background-color: #ffffff; padding: 28px 24px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="vertical-align: top; width: 120px;">
                <img src="${deal.imageSmall}" alt="${escapeHtml(deal.cardName)}" width="110" style="border-radius: 6px; display: block;" />
              </td>
              <td style="vertical-align: top; padding-left: 20px;">
                <div style="font-weight: 700; font-size: 20px; color: #1f2937; line-height: 1.3;">
                  ${escapeHtml(deal.cardName)}
                </div>
                <div style="color: ${TEXT_SECONDARY}; font-size: 14px; margin-top: 4px;">
                  ${escapeHtml(deal.setName)}
                </div>

                <!-- Price comparison -->
                <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px;">
                  <tr>
                    <td style="padding-right: 20px;">
                      <div style="color: ${TEXT_SECONDARY}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">TCGPlayer</div>
                      <div style="color: #9ca3af; font-size: 16px; text-decoration: line-through; margin-top: 2px;">$${deal.tcgPlayerPrice.toFixed(2)}</div>
                    </td>
                    <td>
                      <div style="color: ${TEXT_SECONDARY}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">eBay Price</div>
                      <div style="color: #16a34a; font-size: 20px; font-weight: 700; margin-top: 2px;">$${deal.ebayPrice.toFixed(2)}</div>
                    </td>
                  </tr>
                </table>

                <!-- Save badge -->
                <div style="display: inline-block; background-color: #dcfce7; color: #16a34a; font-weight: 700; font-size: 14px; padding: 6px 14px; border-radius: 20px; margin-top: 12px;">
                  Save ${savePct}%!
                </div>
              </td>
            </tr>
          </table>

          <!-- Buy now button -->
          <div style="text-align: center; margin-top: 28px;">
            <a href="${buyUrl}" style="display: inline-block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 16px; text-decoration: none; padding: 14px 40px; border-radius: 8px;">
              Buy Now on eBay
            </a>
          </div>

          <!-- View more -->
          <div style="text-align: center; margin-top: 16px;">
            <a href="${siteUrl}/buy" style="color: ${YELLOW}; font-size: 14px; font-weight: 600; text-decoration: none;">
              View more deals &rarr;
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding: 24px; text-align: center;">
          <div style="color: ${TEXT_SECONDARY}; font-size: 12px; line-height: 1.6;">
            You received this because you subscribed to PokeShows Daily Card Deals.
            <br />
            <a href="${siteUrl}/unsubscribe" style="color: ${TEXT_SECONDARY}; text-decoration: underline;">Unsubscribe</a>
            &nbsp;&middot;&nbsp;
            <a href="${siteUrl}" style="color: ${TEXT_SECONDARY}; text-decoration: underline;">Visit PokeShows</a>
          </div>
          <div style="color: #d1d5db; font-size: 11px; margin-top: 12px;">
            &copy; ${new Date().getFullYear()} PokeShows. All rights reserved.
          </div>
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
    // Get recent cards of the day with TCGPlayer prices
    const recentCards = await db
      .select()
      .from(cardOfTheDay)
      .orderBy(desc(cardOfTheDay.featuredDate))
      .limit(30);

    // Find best deal: eBay listing cheaper than TCGPlayer market price
    let bestDeal: DealCard | null = null;

    for (const card of recentCards) {
      if (!card.tcgPlayerPrice || card.tcgPlayerPrice <= 0) continue;

      // Find eBay listings that match this card
      const listings = await db
        .select()
        .from(ebayListings)
        .where(sql`${ebayListings.cardSlug} IS NOT NULL AND LOWER(${ebayListings.title}) LIKE ${'%' + card.cardName.toLowerCase().split(' ').slice(0, 3).join('%') + '%'}`)
        .orderBy(ebayListings.price)
        .limit(5);

      for (const listing of listings) {
        if (!listing.price || listing.price <= 0) continue;
        if (listing.price >= card.tcgPlayerPrice) continue;

        const discountPct = ((card.tcgPlayerPrice - listing.price) / card.tcgPlayerPrice) * 100;

        if (!bestDeal || discountPct > bestDeal.discountPct) {
          bestDeal = {
            cardName: card.cardName,
            setName: card.setName,
            imageSmall: card.imageSmall,
            tcgPlayerPrice: card.tcgPlayerPrice,
            ebayPrice: listing.price,
            discountPct,
            searchQuery: `${card.cardName} ${card.setName} pokemon card`,
          };
        }
      }
    }

    // No deals found — skip sending
    if (!bestDeal) {
      return NextResponse.json({ success: true, message: 'No deals found today', emailsSent: 0 });
    }

    // Get active subscribers
    const subscribers = await db
      .select()
      .from(dealSubscribers)
      .where(eq(dealSubscribers.unsubscribed, false));

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscribers', emailsSent: 0 });
    }

    const html = buildDealEmailHtml(bestDeal);
    const subject = `Deal of the Day: ${bestDeal.cardName} — Save ${Math.round(bestDeal.discountPct)}%!`;

    let sent = 0;
    for (const subscriber of subscribers) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'PokeShows <reminders@pokeshows.com>',
            to: [subscriber.email],
            subject,
            html,
          }),
        });
        sent++;
      } catch (err) {
        console.error(`[deal-of-the-day] Error sending to ${subscriber.email}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      deal: bestDeal.cardName,
      discountPct: Math.round(bestDeal.discountPct),
      emailsSent: sent,
    });
  } catch (error) {
    console.error('[deal-of-the-day] Cron failed:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
