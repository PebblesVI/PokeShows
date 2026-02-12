export function buildTcgPlayerAffiliateUrl(tcgPlayerUrl: string): string {
  const affiliateId = process.env.TCGPLAYER_AFFILIATE_ID || 'pokeshows';

  const url = new URL(tcgPlayerUrl);
  url.searchParams.set('utm_campaign', 'affiliate');
  url.searchParams.set('utm_medium', affiliateId);
  url.searchParams.set('utm_source', 'pokeshows');

  return url.toString();
}
