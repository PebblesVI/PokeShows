import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { showReminders, shows } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { differenceInDays, parse, format, subDays } from 'date-fns';
import { buildReminderEmailHtml, buildReminderEmailSubject } from '@/lib/email-templates/show-reminder';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const REMIND_BEFORE_DAYS: Record<string, number> = {
  '1d': 1,
  '3d': 3,
  '7d': 7,
};

const YELLOW = '#FFCB05';
const DARK_BG = '#1a1a2e';

function buildLapsedUserEmailHtml(showName: string, showSlug: string, daysUntil: number): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  const countdown = daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr><td align="center" style="padding: 32px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">
        <tr><td style="background-color: ${DARK_BG}; border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
          <div style="color: ${YELLOW}; font-size: 22px; font-weight: 800;">PokeShows</div>
        </td></tr>
        <tr><td style="background-color: ${YELLOW}; padding: 16px 24px; text-align: center;">
          <div style="color: ${DARK_BG}; font-size: 18px; font-weight: 700;">Don&apos;t Forget!</div>
        </td></tr>
        <tr><td style="background-color: #ffffff; padding: 28px 24px;">
          <h2 style="margin: 0 0 12px; font-size: 20px; color: #1f2937;">${showName}</h2>
          <p style="color: #6b7280; font-size: 16px; font-weight: 600; margin: 0 0 8px;">${countdown}</p>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">
            You saved this show but haven&apos;t visited in a while. Don&apos;t miss it!
          </p>
          <a href="${siteUrl}/shows/${showSlug}" style="display: inline-block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
            View Show Details
          </a>
        </td></tr>
        <tr><td style="padding: 20px 24px; text-align: center;">
          <div style="color: #9ca3af; font-size: 12px;">You received this because you set a reminder on PokeShows.</div>
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
    // Fetch all unsent reminders
    const pendingReminders = await db.select()
      .from(showReminders)
      .where(eq(showReminders.sent, false));

    console.log(`[send-reminders] Found ${pendingReminders.length} pending reminders`);

    let sent = 0;
    let skipped = 0;
    let lapsedSent = 0;
    const now = new Date();

    for (const reminder of pendingReminders) {
      try {
        // Get the show
        const show = await db.query.shows.findFirst({
          where: eq(shows.slug, reminder.showSlug),
        });

        if (!show) {
          // Show no longer exists; mark as sent to avoid retries
          await db.update(showReminders)
            .set({ sent: true })
            .where(eq(showReminders.id, reminder.id));
          skipped++;
          continue;
        }

        const showDate = parse(show.startDate, 'yyyy-MM-dd', new Date());
        const daysUntil = differenceInDays(showDate, now);
        const remindDays = REMIND_BEFORE_DAYS[reminder.remindBefore] || 1;

        // Send if the show is within the reminder window
        if (daysUntil <= remindDays && daysUntil >= 0) {
          const html = buildReminderEmailHtml(show, daysUntil);
          const subject = buildReminderEmailSubject(show, daysUntil);

          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'PokeShows <reminders@pokeshows.com>',
              to: [reminder.email],
              subject,
              html,
            }),
          });

          if (emailRes.ok) {
            await db.update(showReminders)
              .set({ sent: true })
              .where(eq(showReminders.id, reminder.id));
            sent++;
            console.log(`[send-reminders] Sent reminder to ${reminder.email} for ${show.name}`);
          } else {
            const errBody = await emailRes.text();
            console.error(`[send-reminders] Resend API error for ${reminder.email}:`, errBody);
          }
        } else if (daysUntil < 0) {
          // Show already passed; mark as sent
          await db.update(showReminders)
            .set({ sent: true })
            .where(eq(showReminders.id, reminder.id));
          skipped++;
        }
      } catch (err) {
        console.error(`[send-reminders] Error processing reminder ${reminder.id}:`, err);
      }
    }

    // Lapsed user re-engagement: find users with unsent reminders for shows
    // coming up in 7-14 days whose reminder was created >14 days ago
    try {
      const today = format(now, 'yyyy-MM-dd');
      const twoWeeksAgo = format(subDays(now, 14), 'yyyy-MM-dd');
      const twoWeeksFromNow = format(new Date(now.getTime() + 14 * 86400000), 'yyyy-MM-dd');

      // Find reminders created more than 14 days ago for upcoming shows that haven't been sent
      const lapsedReminders = await db.select()
        .from(showReminders)
        .where(and(
          eq(showReminders.sent, false),
          sql`${showReminders.createdAt} < ${twoWeeksAgo}`,
        ));

      for (const reminder of lapsedReminders) {
        const show = await db.query.shows.findFirst({
          where: eq(shows.slug, reminder.showSlug),
        });

        if (!show) continue;

        const showDate = parse(show.startDate, 'yyyy-MM-dd', new Date());
        const daysUntil = differenceInDays(showDate, now);

        // Show is coming up in the next 14 days
        if (daysUntil > 0 && daysUntil <= 14) {
          const html = buildLapsedUserEmailHtml(show.name, show.slug, daysUntil);

          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: 'PokeShows <reminders@pokeshows.com>',
                to: [reminder.email],
                subject: `Don't forget: ${show.name} is ${daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}!`,
                html,
              }),
            });
            lapsedSent++;
          } catch (err) {
            console.error(`[send-reminders] Lapsed email error:`, err);
          }
        }
      }
    } catch (err) {
      console.error('[send-reminders] Lapsed re-engagement error:', err);
    }

    return NextResponse.json({
      success: true,
      total: pendingReminders.length,
      sent,
      skipped,
      lapsedSent,
    });
  } catch (error) {
    console.error('[send-reminders] Cron failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
