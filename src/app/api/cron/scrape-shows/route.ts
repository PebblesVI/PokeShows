import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers } from '@/scrapers/runner';
import { deactivatePastShows } from '@/db/queries/shows';
import { db } from '@/db';
import { showAlerts, shows } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { format, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const YELLOW = '#FFCB05';
const DARK_BG = '#1a1a2e';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildNewShowAlertHtml(matchingShows: { name: string; slug: string; city: string; state: string; startDate: string }[]): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  const showsList = matchingShows.map(s =>
    `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
      <a href="${siteUrl}/shows/${s.slug}" style="color: #1f2937; font-weight: 600; text-decoration: none;">${escapeHtml(s.name)}</a>
      <div style="color: #6b7280; font-size: 13px; margin-top: 2px;">${escapeHtml(s.city)}, ${escapeHtml(s.state)} &middot; ${s.startDate}</div>
    </td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr><td align="center" style="padding: 32px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">
        <tr><td style="background-color: ${DARK_BG}; border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
          <div style="color: ${YELLOW}; font-size: 22px; font-weight: 800;">PokeShows</div>
          <div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">New Show Alert</div>
        </td></tr>
        <tr><td style="background-color: ${YELLOW}; padding: 16px 24px; text-align: center;">
          <div style="color: ${DARK_BG}; font-size: 18px; font-weight: 700;">New Shows Near You!</div>
        </td></tr>
        <tr><td style="background-color: #ffffff; padding: 28px 24px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">${showsList}</table>
          <div style="margin-top: 20px;">
            <a href="${siteUrl}/shows" style="display: inline-block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
              View All Shows
            </a>
          </div>
        </td></tr>
        <tr><td style="padding: 20px 24px; text-align: center;">
          <div style="color: #9ca3af; font-size: 12px;">You set up show alerts on PokeShows. <a href="${siteUrl}" style="color: #9ca3af; text-decoration: underline;">Visit PokeShows</a></div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendNewShowAlerts() {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return 0;

  // Get shows created in the last day (newly scraped)
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  const alerts = await db.select().from(showAlerts);
  let alertsSent = 0;

  for (const alert of alerts) {
    try {
      const conditions = [
        eq(shows.isActive, true),
        eq(shows.state, alert.state),
        gte(shows.startDate, today),
        sql`date(${shows.createdAt}) >= ${yesterday}`,
      ];

      if (alert.city) {
        conditions.push(eq(shows.city, alert.city));
      }

      const newShows = await db.select()
        .from(shows)
        .where(and(...conditions))
        .limit(10);

      if (newShows.length > 0) {
        const html = buildNewShowAlertHtml(newShows);

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'PokeShows <reminders@pokeshows.com>',
            to: [alert.email],
            subject: `${newShows.length} new card show${newShows.length > 1 ? 's' : ''} in ${alert.city || alert.state}`,
            html,
          }),
        });
        alertsSent++;
      }
    } catch (err) {
      console.error(`[scrape-shows] Error sending show alert to ${alert.email}:`, err);
    }
  }

  return alertsSent;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Step 1: Auto-expire past shows
    console.log('[cron/scrape-shows] Deactivating past shows...');
    await deactivatePastShows();

    // Step 2: Run scraper pipeline
    console.log('[cron/scrape-shows] Starting scraper pipeline...');
    const result = await runAllScrapers();

    // Step 3: Send new show alerts
    console.log('[cron/scrape-shows] Checking for new show alerts...');
    const alertsSent = await sendNewShowAlerts();

    return NextResponse.json({
      success: true,
      ...result,
      alertsSent,
      message: `Scraper pipeline complete. Total: ${result.total}, Created: ${result.created}, Updated: ${result.updated}, Alerts: ${alertsSent}`,
    });
  } catch (error) {
    console.error('[cron/scrape-shows] Pipeline failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
