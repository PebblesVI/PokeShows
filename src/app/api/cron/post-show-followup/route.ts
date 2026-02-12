import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { showReminders, shows } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { format, subDays } from 'date-fns';
import { buildEbaySearchUrl } from '@/lib/ebay';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const YELLOW = '#FFCB05';
const DARK_BG = '#1a1a2e';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildFollowupEmailHtml(showName: string, showSlug: string, city: string, state: string): string {
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
          <div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">Post-Show Follow-up</div>
        </td></tr>
        <tr><td style="background-color: ${YELLOW}; padding: 16px 24px; text-align: center;">
          <div style="color: ${DARK_BG}; font-size: 18px; font-weight: 700;">How was the show?</div>
        </td></tr>
        <tr><td style="background-color: #ffffff; padding: 28px 24px;">
          <h2 style="margin: 0 0 12px; font-size: 20px; color: #1f2937;">${escapeHtml(showName)}</h2>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Hope you had a great time! Share your experience and help other collectors find the best shows.
          </p>
          <div style="margin-bottom: 16px;">
            <a href="${siteUrl}/shows/${showSlug}#reviews" style="display: inline-block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin-right: 8px;">
              Rate This Show
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin: 16px 0 0;">
            Looking for more shows near ${escapeHtml(city)}, ${escapeHtml(state)}?
          </p>
          <a href="${siteUrl}/shows/state/${state.toLowerCase()}" style="display: inline-block; margin-top: 8px; color: ${YELLOW}; font-size: 13px; font-weight: 600; text-decoration: none;">
            Browse upcoming shows &rarr;
          </a>

          <!-- Protect Your New Cards -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #1f2937;">Protect Your New Cards</h3>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom: 10px;">
                  <a href="${buildEbaySearchUrl({ searchQuery: 'pokemon card sleeves top loaders', customId: 'followup-sleeves' })}" style="display: block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 20px; border-radius: 8px; text-align: center;">
                    Card Sleeves &amp; Top Loaders
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 10px;">
                  <a href="${buildEbaySearchUrl({ searchQuery: 'PSA grading submission pokemon', customId: 'followup-grading' })}" style="display: block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 20px; border-radius: 8px; text-align: center;">
                    Grading Submissions
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <a href="${buildEbaySearchUrl({ searchQuery: 'PSA graded card storage case', customId: 'followup-storage' })}" style="display: block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 20px; border-radius: 8px; text-align: center;">
                    PSA Slab Cases
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </td></tr>
        <tr><td style="padding: 20px 24px; text-align: center;">
          <div style="color: #9ca3af; font-size: 12px;">You received this because you set a reminder for this show on PokeShows.</div>
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
    // Find shows that ended yesterday
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // Get shows that ended yesterday (endDate = yesterday, or single-day shows with startDate = yesterday)
    const endedShows = await db.select()
      .from(shows)
      .where(
        sql`(${shows.endDate} = ${yesterday} OR (${shows.endDate} IS NULL AND ${shows.startDate} = ${yesterday}))`,
      );

    let sent = 0;

    for (const show of endedShows) {
      // Find users who had reminders for this show
      const reminders = await db.select()
        .from(showReminders)
        .where(and(
          eq(showReminders.showSlug, show.slug),
          eq(showReminders.sent, true), // Only users who actually got a reminder
        ));

      const uniqueEmails = [...new Set(reminders.map(r => r.email))];

      for (const email of uniqueEmails) {
        try {
          const html = buildFollowupEmailHtml(show.name, show.slug, show.city, show.state);

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'PokeShows <reminders@pokeshows.com>',
              to: [email],
              subject: `How was ${show.name}? Rate it and find more shows`,
              html,
            }),
          });
          sent++;
        } catch (err) {
          console.error(`[post-show-followup] Error sending to ${email}:`, err);
        }
      }
    }

    return NextResponse.json({ success: true, showsEnded: endedShows.length, emailsSent: sent });
  } catch (error) {
    console.error('[post-show-followup] Cron failed:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
