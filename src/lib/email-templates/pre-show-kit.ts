import { buildEbaySearchUrl } from '@/lib/ebay';
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

const TRENDING_CARDS = [
  { name: 'Charizard ex', query: 'pokemon charizard ex card' },
  { name: 'Pikachu VMAX', query: 'pokemon pikachu vmax' },
  { name: 'Mew ex', query: 'pokemon mew ex card' },
  { name: 'Lugia V Alt Art', query: 'pokemon lugia v alt art' },
];

const SUPPLY_CHECKLIST = [
  { label: 'Penny Sleeves (100ct)', query: 'penny sleeves 100 card', customId: 'preshow-sleeves' },
  { label: 'Top Loaders (25ct)', query: 'ultra pro top loaders 25 pack', customId: 'preshow-toploaders' },
  { label: 'PSA Slab Storage Case', query: 'PSA graded card storage case', customId: 'preshow-psacase' },
  { label: 'Magnetic One-Touch Holders', query: 'magnetic card holder 35pt one touch', customId: 'preshow-magnetic' },
  { label: 'Team Bags', query: 'team bags resealable cards', customId: 'preshow-teambags' },
];

export function buildPreShowKitEmailHtml(show: Show): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  const showUrl = `${siteUrl}/shows/${show.slug}`;
  const location = [show.venueName, show.address, `${show.city}, ${show.state}`].filter(Boolean).join(', ');

  const trendingCardsHtml = TRENDING_CARDS.map(card => {
    const url = buildEbaySearchUrl({ searchQuery: card.query, customId: `preshow-trending` });
    return `<tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
        <a href="${url}" style="color: #1f2937; text-decoration: none; font-weight: 500;">${escapeHtml(card.name)}</a>
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <a href="${url}" style="color: ${DARK_BG}; background-color: ${YELLOW}; padding: 4px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 600;">Check Prices</a>
      </td>
    </tr>`;
  }).join('');

  const supplyLinksHtml = SUPPLY_CHECKLIST.map(item => {
    const url = buildEbaySearchUrl({ searchQuery: item.query, customId: item.customId });
    return `<a href="${url}" style="display: inline-block; border: 1px solid #e5e7eb; color: #374151; font-size: 13px; text-decoration: none; padding: 8px 14px; border-radius: 6px; margin: 0 6px 6px 0; background-color: #ffffff;">
      &#9745; ${item.label}
    </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Show Day Prep Kit: ${escapeHtml(show.name)}</title>
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
              <div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">Pre-Show Shopping Kit</div>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="background-color: ${YELLOW}; padding: 16px 24px; text-align: center;">
              <div style="color: ${DARK_BG}; font-size: 18px; font-weight: 700;">Your Show is in 2 Days!</div>
            </td>
          </tr>

          <!-- Show Details -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px;">
              <h2 style="margin: 0 0 8px; font-size: 20px; color: #1f2937;">${escapeHtml(show.name)}</h2>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 4px;">
                <strong>Date:</strong> ${show.startDate}${show.endDate ? ` — ${show.endDate}` : ''}
              </p>
              ${show.startTime ? `<p style="color: #6b7280; font-size: 14px; margin: 0 0 4px;"><strong>Time:</strong> ${escapeHtml(show.startTime)}${show.endTime ? ` — ${escapeHtml(show.endTime)}` : ''}</p>` : ''}
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">
                <strong>Location:</strong> ${escapeHtml(location)}
              </p>
              <a href="${showUrl}" style="display: inline-block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 10px 24px; border-radius: 8px;">
                View Show Details
              </a>
            </td>
          </tr>

          <!-- Trending Cards -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 24px 24px; border-top: 1px solid #e5e7eb;">
              <div style="padding-top: 20px;">
                <h3 style="margin: 0 0 12px; font-size: 16px; color: #1f2937;">&#128293; Trending Cards to Watch</h3>
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px;">Know the market prices before you haggle at the show:</p>
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                  ${trendingCardsHtml}
                </table>
              </div>
            </td>
          </tr>

          <!-- Supply Checklist -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 24px 24px; border-top: 1px solid #e5e7eb;">
              <div style="padding-top: 20px;">
                <h3 style="margin: 0 0 8px; font-size: 16px; color: #1f2937;">&#9989; Show Day Supply Checklist</h3>
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px;">Don&apos;t forget the essentials to protect your purchases:</p>
                ${supplyLinksHtml}
              </div>
            </td>
          </tr>

          <!-- Scanner CTA -->
          <tr>
            <td style="background-color: ${DARK_BG}; padding: 20px 24px; text-align: center;">
              <p style="color: #e5e7eb; font-size: 14px; margin: 0 0 12px;">Use our mobile price scanner at the show!</p>
              <a href="${siteUrl}/tools/scan" style="display: inline-block; background-color: ${YELLOW}; color: ${DARK_BG}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 10px 24px; border-radius: 8px;">
                Open Price Scanner
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; text-align: center;">
              <div style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
                You received this because you marked &quot;Going&quot; to this show on PokeShows.
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

export function buildPreShowKitEmailSubject(show: Show): string {
  return `Your Show Day Prep Kit: ${show.name} in ${show.city}, ${show.state}`;
}
