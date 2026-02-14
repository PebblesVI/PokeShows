export function buildTcgPlayerAffiliateUrl(tcgPlayerUrl: string): string {
  const affiliateId = process.env.TCGPLAYER_AFFILIATE_ID || 'pokeshows';

  const url = new URL(tcgPlayerUrl);
  url.searchParams.set('utm_campaign', 'affiliate');
  url.searchParams.set('utm_medium', affiliateId);
  url.searchParams.set('utm_source', 'pokeshows');

  return url.toString();
}

export function buildTcgPlayerSearchUrl(cardName: string): string {
  const affiliateId = process.env.TCGPLAYER_AFFILIATE_ID || 'pokeshows';

  const params = new URLSearchParams({
    q: cardName,
    utm_campaign: 'affiliate',
    utm_medium: affiliateId,
    utm_source: 'pokeshows',
  });

  return `https://www.tcgplayer.com/search/pokemon/product?${params.toString()}`;
}
