import { generateGoogleCalendarUrl } from '@/lib/calendar';
import type { Show } from '@/types/show';

const YELLOW = '#FFCB05';
const DARK_BG = '#1a1a2e';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildReminderEmailHtml(show: Show, daysUntil: number): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  const showUrl = `${siteUrl}/shows/${show.slug}`;
  const gcalUrl = generateGoogleCalendarUrl(show);
  const location = [show.venueName, show.address, `${show.city}, ${show.state}`].filter(Boolean).join(', ');

  const countdownText = daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow!' : `In ${daysUntil} days!`;

  const gearLinks = [
    { label: 'Card Sleeves & Top Loaders', query: 'pokemon+card+sleeves+top+loaders' },
    { label: 'PSA Slab Cases', query: 'PSA+graded+card+storage+case' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reminder: ${escapeHtml(show.name)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: ${DARK_BG}; border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
              <div style="color: ${YELLOW}; font-size: 22px; font-weight: 800;">PokeShows</div>
              <div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">Show Reminder</div>
            </td>
          </tr>

          <!-- Countdown banner -->
          <tr>
            <td style="background-color: ${YELLOW}; padding: 16px 24px; text-align: center;">
              <div style="color: ${DARK_BG}; font-size: 18px; font-weight: 700;">${countdownText}</div>
            </td>
          </tr>

          <!-- Show details -->
          <tr>
            <td style="background-color: #ffffff; padding: 28px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; color: #1f2937;">${escapeHtml(show.name)}</h2>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="color: #6b7280; font-size: 14px; line-height: 1.8;">
                <tr><td style="padding: 2px 0;"><strong>Date:</strong> ${show.startDate}${show.endDate ? ` — ${show.endDate}` : ''}</td></tr>
                ${show.startTime ? `<tr><td style="padding: 2px 0;"><strong>Time:</strong> ${escapeHtml(show.startTime)}${show.endTime ? ` — ${escapeHtml(show.endTime)}` : ''}</td></tr>` : ''}
                <tr><td style="padding: 2px 0;"><strong>Location:</strong> ${escapeHtml(location)}</td></tr>
                ${show.admissionPrice ? `<tr><td style="padding: 2px 0;"><strong>Admission:</strong> ${escapeHtml(show.admissionPrice)}</td></tr>` : ''}
              </table>

              <!-- Action buttons -->
              <div style="margin-top: 20px;">
                <a href="${showUrl}" style="display: inline-block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin-right: 8px;">
                  View Details
                </a>
                <a href="${gcalUrl}" style="display: inline-block; border: 2px solid #e5e7eb; color: #1f2937; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 24px; border-radius: 8px;">
                  Add to Calendar
                </a>
              </div>
            </td>
          </tr>

          <!-- Gear up section -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 24px 24px; border-top: 1px solid #e5e7eb;">
              <div style="padding-top: 20px;">
                <h3 style="margin: 0 0 12px; font-size: 15px; color: #1f2937;">Gear Up for the Show</h3>
                ${gearLinks.map(({ label, query }) => `
                  <a href="${siteUrl}/buy?q=${query}" style="display: inline-block; border: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; text-decoration: none; padding: 8px 16px; border-radius: 6px; margin: 0 6px 6px 0;">
                    ${label} &rarr;
                  </a>
                `).join('')}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; text-align: center;">
              <div style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
                You received this because you set a reminder on PokeShows.
                <br />
                <a href="${siteUrl}" style="color: #9ca3af; text-decoration: underline;">Visit PokeShows</a>
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

export function buildReminderEmailSubject(show: Show, daysUntil: number): string {
  if (daysUntil === 0) return `Today: ${show.name} in ${show.city}, ${show.state}`;
  if (daysUntil === 1) return `Tomorrow: ${show.name} in ${show.city}, ${show.state}`;
  return `${daysUntil} days until ${show.name} in ${show.city}, ${show.state}`;
}
