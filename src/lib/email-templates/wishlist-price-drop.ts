import { buildEbaySearchUrl } from '@/lib/ebay';
import { buildTcgPlayerAffiliateUrl } from '@/lib/tcgplayer-affiliate';

const YELLOW = '#FFCB05';
const DARK_BG = '#1a1a2e';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface DroppedCard {
  name: string;
  previousPrice: number;
  currentPrice: number;
  dropPercent: number;
  tcgPlayerUrl?: string | null;
}

export function buildWishlistPriceDropEmailHtml(cards: DroppedCard[]): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  const cardRows = cards.map(card => {
    const ebayUrl = buildEbaySearchUrl({
      searchQuery: `pokemon ${card.name}`,
      customId: 'wishlist-alert',
    });
    const tcgUrl = card.tcgPlayerUrl ? buildTcgPlayerAffiliateUrl(card.tcgPlayerUrl) : null;

    return `<tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 600; color: #1f2937;">${escapeHtml(card.name)}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
          Was $${card.previousPrice.toFixed(2)} &rarr; Now <strong style="color: #059669;">$${card.currentPrice.toFixed(2)}</strong>
          <span style="color: #059669; font-weight: 600;"> (-${card.dropPercent.toFixed(0)}%)</span>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; white-space: nowrap;">
        <a href="${ebayUrl}" style="display: inline-block; background-color: ${YELLOW}; color: ${DARK_BG}; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 700; margin-right: 4px;">
          Buy on eBay
        </a>
        ${tcgUrl ? `<a href="${tcgUrl}" style="display: inline-block; border: 1px solid #e5e7eb; color: #374151; padding: 5px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">
          TCGPlayer
        </a>` : ''}
      </td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr><td align="center" style="padding: 32px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">

        <tr><td style="background-color: ${DARK_BG}; border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
          <div style="color: ${YELLOW}; font-size: 22px; font-weight: 800;">PokeShows</div>
          <div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">Wishlist Price Alert</div>
        </td></tr>

        <tr><td style="background-color: ${YELLOW}; padding: 16px 24px; text-align: center;">
          <div style="color: ${DARK_BG}; font-size: 18px; font-weight: 700;">
            ${cards.length === 1 ? 'Price Drop on Your Wishlist!' : `${cards.length} Cards Dropped in Price!`}
          </div>
        </td></tr>

        <tr><td style="background-color: #ffffff; padding: 24px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">
            Good news! ${cards.length === 1 ? 'A card' : 'Cards'} on your wishlist just dropped in price:
          </p>
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            ${cardRows}
          </table>
        </td></tr>

        <tr><td style="background-color: #ffffff; padding: 0 24px 24px; text-align: center;">
          <a href="${siteUrl}/wishlist" style="display: inline-block; background-color: ${DARK_BG}; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
            View My Wishlist
          </a>
        </td></tr>

        <tr><td style="padding: 20px 24px; text-align: center;">
          <div style="color: #9ca3af; font-size: 12px;">
            You set up wishlist price alerts on PokeShows.
            <br /><a href="${siteUrl}" style="color: #9ca3af; text-decoration: underline;">Visit PokeShows</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function buildWishlistPriceDropEmailSubject(cards: DroppedCard[]): string {
  if (cards.length === 1) {
    return `Price Drop: ${cards[0].name} is now $${cards[0].currentPrice.toFixed(2)} (-${cards[0].dropPercent.toFixed(0)}%)`;
  }
  return `${cards.length} Wishlist Cards Dropped in Price!`;
}
