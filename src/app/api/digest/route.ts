import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { shows, cardOfTheDay } from '@/db/schema';
import { eq, gte, lte, and, asc, desc } from 'drizzle-orm';
import { format, addDays } from 'date-fns';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const stateFilter = searchParams.get('state')?.toUpperCase() || null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const nextWeekStr = format(addDays(today, 7), 'yyyy-MM-dd');
  const formattedToday = format(today, 'MMMM d, yyyy');

  try {
    // Fetch upcoming shows for the next 7 days
    const conditions = [
      eq(shows.isActive, true),
      gte(shows.startDate, todayStr),
      lte(shows.startDate, nextWeekStr),
    ];

    if (stateFilter) {
      conditions.push(eq(shows.state, stateFilter));
    }

    const upcomingShows = await db
      .select()
      .from(shows)
      .where(and(...conditions))
      .orderBy(asc(shows.startDate))
      .limit(20);

    // Fetch today's Card of the Day
    const [todayCard] = await db
      .select()
      .from(cardOfTheDay)
      .orderBy(desc(cardOfTheDay.featuredDate))
      .limit(1);

    const stateLabel = stateFilter ? ` in ${stateFilter}` : '';
    const subjectLine = `Pokemon Card Shows This Week${stateLabel} - ${formattedToday}`;

    const html = buildEmailHtml({
      siteUrl,
      subjectLine,
      stateLabel,
      formattedToday,
      upcomingShows,
      todayCard,
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Digest generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate digest' },
      { status: 500 },
    );
  }
}

interface ShowRow {
  slug: string;
  name: string;
  startDate: string;
  endDate: string | null;
  city: string;
  state: string;
  venueName: string | null;
  admissionPrice: string | null;
  startTime: string | null;
}

interface CardRow {
  cardName: string;
  setName: string;
  rarity: string | null;
  artist: string | null;
  imageSmall: string;
  imageLarge: string;
  tcgPlayerUrl: string | null;
  priceMid: number | null;
  featuredDate: string;
}

function buildEmailHtml({
  siteUrl,
  subjectLine,
  stateLabel,
  formattedToday,
  upcomingShows,
  todayCard,
}: {
  siteUrl: string;
  subjectLine: string;
  stateLabel: string;
  formattedToday: string;
  upcomingShows: ShowRow[];
  todayCard: CardRow | undefined;
}) {
  const YELLOW = '#FFCB05';
  const DARK_BG = '#1a1a2e';
  const CARD_BG = '#f9fafb';
  const TEXT_PRIMARY = '#1f2937';
  const TEXT_SECONDARY = '#6b7280';
  const BORDER = '#e5e7eb';

  const showRows = upcomingShows
    .map((show) => {
      const showDate = new Date(show.startDate + 'T00:00:00');
      const dateFormatted = format(showDate, 'EEE, MMM d');
      const endDateFormatted = show.endDate
        ? ` - ${format(new Date(show.endDate + 'T00:00:00'), 'MMM d')}`
        : '';
      const venue = show.venueName ? `<br>${escapeHtml(show.venueName)}` : '';
      const price = show.admissionPrice
        ? `<br>Admission: ${escapeHtml(show.admissionPrice)}`
        : '';
      const time = show.startTime ? ` at ${escapeHtml(show.startTime)}` : '';

      return `
        <tr>
          <td style="padding: 20px 24px; border-bottom: 1px solid ${BORDER};">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align: top; width: 90px;">
                  <div style="background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 13px; text-align: center; padding: 8px 12px; border-radius: 6px; line-height: 1.3;">
                    ${dateFormatted}${endDateFormatted}
                  </div>
                </td>
                <td style="vertical-align: top; padding-left: 16px;">
                  <a href="${siteUrl}/shows/${show.slug}" style="color: ${TEXT_PRIMARY}; font-weight: 700; font-size: 16px; text-decoration: none; line-height: 1.3;">
                    ${escapeHtml(show.name)}
                  </a>
                  <div style="color: ${TEXT_SECONDARY}; font-size: 14px; margin-top: 4px; line-height: 1.5;">
                    ${escapeHtml(show.city)}, ${escapeHtml(show.state)}${time}${venue}${price}
                  </div>
                  <a href="${siteUrl}/shows/${show.slug}" style="display: inline-block; margin-top: 8px; color: ${YELLOW}; font-size: 13px; font-weight: 600; text-decoration: none;">
                    View Details &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join('');

  const noShowsMessage = `
    <tr>
      <td style="padding: 32px 24px; text-align: center; color: ${TEXT_SECONDARY}; font-size: 15px;">
        No shows found for the next 7 days${stateLabel}. Check back soon — new shows are added regularly!
      </td>
    </tr>`;

  const cardSection = todayCard
    ? `
    <!-- Card of the Day -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 24px;">
      <tr>
        <td style="background-color: ${DARK_BG}; border-radius: 8px; padding: 28px 24px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="color: ${YELLOW}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding-bottom: 16px;">
                &#9733; Card of the Day
              </td>
            </tr>
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="vertical-align: top; width: 100px;">
                      <img src="${todayCard.imageSmall}" alt="${escapeHtml(todayCard.cardName)}" width="90" style="border-radius: 6px; display: block;" />
                    </td>
                    <td style="vertical-align: top; padding-left: 16px;">
                      <div style="color: #ffffff; font-weight: 700; font-size: 18px; line-height: 1.3;">
                        ${escapeHtml(todayCard.cardName)}
                      </div>
                      <div style="color: #9ca3af; font-size: 14px; margin-top: 4px;">
                        ${escapeHtml(todayCard.setName)}${todayCard.rarity ? ` &middot; ${escapeHtml(todayCard.rarity)}` : ''}
                      </div>
                      ${todayCard.artist ? `<div style="color: #9ca3af; font-size: 13px; margin-top: 2px;">Artist: ${escapeHtml(todayCard.artist)}</div>` : ''}
                      ${todayCard.priceMid ? `<div style="color: ${YELLOW}; font-weight: 700; font-size: 16px; margin-top: 8px;">~$${todayCard.priceMid.toFixed(2)}</div>` : ''}
                      <a href="${siteUrl}/card-of-the-day" style="display: inline-block; margin-top: 10px; color: ${YELLOW}; font-size: 13px; font-weight: 600; text-decoration: none;">
                        See full details &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subjectLine)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Wrapper -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- Main container -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: ${DARK_BG}; border-radius: 8px 8px 0 0; padding: 28px 24px; text-align: center;">
              <div style="border-top: 4px solid ${YELLOW}; width: 60px; margin: 0 auto 16px;"></div>
              <div style="color: ${YELLOW}; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">
                PokeShows
              </div>
              <div style="color: #9ca3af; font-size: 14px; margin-top: 6px;">
                Weekly Digest &middot; ${formattedToday}
              </div>
            </td>
          </tr>

          <!-- Title bar -->
          <tr>
            <td style="background-color: ${YELLOW}; padding: 14px 24px; text-align: center;">
              <div style="color: ${DARK_BG}; font-size: 15px; font-weight: 700;">
                Upcoming Shows This Week${stateLabel}
              </div>
            </td>
          </tr>

          <!-- Shows list -->
          <tr>
            <td style="background-color: #ffffff;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${upcomingShows.length > 0 ? showRows : noShowsMessage}
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px; text-align: center; border-top: 1px solid ${BORDER};">
              <a href="${siteUrl}/shows" style="display: inline-block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 36px; border-radius: 8px;">
                View All Shows
              </a>
            </td>
          </tr>

          <!-- Card of the Day section -->
          <tr>
            <td style="padding: 0 0 0 0;">
              ${cardSection}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 24px; text-align: center;">
              <div style="color: ${TEXT_SECONDARY}; font-size: 13px; line-height: 1.6;">
                You received this because you subscribed to the PokeShows weekly digest.
                <br />
                <a href="${siteUrl}/unsubscribe" style="color: ${TEXT_SECONDARY}; text-decoration: underline;">
                  Unsubscribe
                </a>
                &nbsp;&middot;&nbsp;
                <a href="${siteUrl}" style="color: ${TEXT_SECONDARY}; text-decoration: underline;">
                  Visit PokeShows
                </a>
              </div>
              <div style="color: #d1d5db; font-size: 11px; margin-top: 12px;">
                &copy; ${new Date().getFullYear()} PokeShows. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
