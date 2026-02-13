import { buildEbaySearchUrl } from '@/lib/ebay';

const YELLOW = '#FFCB05';
const DARK_BG = '#1a1a2e';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface CardMover {
  name: string;
  change: number; // positive = gain, negative = loss
}

interface CollectionValueAlertData {
  totalValue: number;
  previousValue: number;
  changePercent: number;
  topGainers: CardMover[];
  topLosers: CardMover[];
}

export function buildCollectionValueAlertSubject(data: CollectionValueAlertData): string {
  const direction = data.changePercent >= 0 ? 'up' : 'down';
  const absPercent = Math.abs(data.changePercent).toFixed(1);
  return `Your collection is ${direction} ${absPercent}% - Now worth $${data.totalValue.toFixed(2)}`;
}

export function buildCollectionValueAlertHtml(data: CollectionValueAlertData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  const isPositive = data.changePercent >= 0;
  const changeColor = isPositive ? '#059669' : '#dc2626';
  const changeArrow = isPositive ? '&#9650;' : '&#9660;';
  const absPercent = Math.abs(data.changePercent).toFixed(1);
  const valueDiff = Math.abs(data.totalValue - data.previousValue).toFixed(2);

  function buildMoverRows(movers: CardMover[], type: 'gainer' | 'loser'): string {
    if (movers.length === 0) return '';

    const rows = movers.map((mover) => {
      const color = type === 'gainer' ? '#059669' : '#dc2626';
      const sign = type === 'gainer' ? '+' : '';
      const ebayUrl = buildEbaySearchUrl({
        searchQuery: `pokemon ${mover.name}`,
        customId: 'collection-alert',
      });

      return `<tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
          <span style="font-size: 13px; color: #1f2937;">${escapeHtml(mover.name)}</span>
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <span style="color: ${color}; font-weight: 600; font-size: 13px;">${sign}$${mover.change.toFixed(2)}</span>
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <a href="${ebayUrl}" style="color: ${DARK_BG}; background-color: ${YELLOW}; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 700;">
            ${type === 'gainer' ? 'Sell' : 'Buy'}
          </a>
        </td>
      </tr>`;
    }).join('');

    const title = type === 'gainer' ? 'Top Gainers' : 'Top Losers';
    const emoji = type === 'gainer' ? '&#128200;' : '&#128201;';

    return `
      <div style="margin-top: 20px;">
        <div style="font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 8px;">${emoji} ${title}</div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          ${rows}
        </table>
      </div>`;
  }

  const gainersHtml = buildMoverRows(data.topGainers, 'gainer');
  const losersHtml = buildMoverRows(data.topLosers, 'loser');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr><td align="center" style="padding: 32px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">

        <tr><td style="background-color: ${DARK_BG}; border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
          <div style="color: ${YELLOW}; font-size: 22px; font-weight: 800;">PokeShows</div>
          <div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">Weekly Collection Report</div>
        </td></tr>

        <tr><td style="background-color: ${YELLOW}; padding: 16px 24px; text-align: center;">
          <div style="color: ${DARK_BG}; font-size: 18px; font-weight: 700;">
            Your Collection ${isPositive ? 'Gained' : 'Lost'} Value
          </div>
        </td></tr>

        <tr><td style="background-color: #ffffff; padding: 28px 24px;">
          <!-- Portfolio Summary -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="text-align: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px 0 0 8px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Current Value</div>
                <div style="font-size: 22px; font-weight: 800; color: #1f2937;">$${data.totalValue.toFixed(2)}</div>
              </td>
              <td style="text-align: center; padding: 12px; border: 1px solid #e5e7eb; border-left: none;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Previous</div>
                <div style="font-size: 16px; font-weight: 600; color: #6b7280;">$${data.previousValue.toFixed(2)}</div>
              </td>
              <td style="text-align: center; padding: 12px; border: 1px solid #e5e7eb; border-left: none; border-radius: 0 8px 8px 0;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Change</div>
                <div style="font-size: 16px; font-weight: 700; color: ${changeColor};">
                  ${changeArrow} ${absPercent}%
                  <div style="font-size: 12px; font-weight: 500;">${isPositive ? '+' : '-'}$${valueDiff}</div>
                </div>
              </td>
            </tr>
          </table>

          ${gainersHtml}
          ${losersHtml}
        </td></tr>

        <tr><td style="background-color: #ffffff; padding: 0 24px 24px; text-align: center;">
          <a href="${siteUrl}/tools/collection-value" style="display: inline-block; background-color: ${DARK_BG}; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin-right: 8px;">
            View Full Report
          </a>
          <a href="${siteUrl}/collection/trades" style="display: inline-block; border: 2px solid ${DARK_BG}; color: ${DARK_BG}; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 24px; border-radius: 8px;">
            Trade Cards
          </a>
        </td></tr>

        <tr><td style="padding: 20px 24px; text-align: center;">
          <div style="color: #9ca3af; font-size: 12px;">
            You receive this because you have cards in your PokeShows collection.
            <br /><a href="${siteUrl}" style="color: #9ca3af; text-decoration: underline;">Visit PokeShows</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
