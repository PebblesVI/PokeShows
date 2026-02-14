import { buildEbaySearchUrl } from '@/lib/ebay';
import { buildTcgPlayerAffiliateUrl, buildTcgPlayerSearchUrl } from '@/lib/tcgplayer-affiliate';

interface BuildTrackedUrlParams {
  url: string;
  destination: 'ebay' | 'tcgplayer';
  cardName?: string;
  cardId?: string;
  sourcePage: string;
  customId?: string;
}

export function buildTrackedUrl({
  url,
  destination,
  cardName,
  cardId,
  sourcePage,
  customId,
}: BuildTrackedUrlParams): string {
  const params = new URLSearchParams();
  params.set('url', url);
  params.set('dest', destination);
  if (cardName) params.set('card', cardName);
  if (cardId) params.set('cardId', cardId);
  params.set('source', sourcePage);
  if (customId) params.set('cid', customId);

  return `/api/click?${params.toString()}`;
}

interface BuildTrackedEbayUrlParams {
  searchQuery: string;
  category?: string;
  customId?: string;
  cardName?: string;
  cardId?: string;
  sourcePage: string;
}

export function buildTrackedEbayUrl({
  searchQuery,
  category,
  customId,
  cardName,
  cardId,
  sourcePage,
}: BuildTrackedEbayUrlParams): string {
  const ebayUrl = buildEbaySearchUrl({ searchQuery, category, customId });
  return buildTrackedUrl({
    url: ebayUrl,
    destination: 'ebay',
    cardName,
    cardId,
    sourcePage,
    customId,
  });
}

export function buildTrackedTcgPlayerUrl(
  tcgPlayerUrl: string,
  sourcePage: string,
  cardName?: string,
  cardId?: string,
): string {
  const affiliateUrl = buildTcgPlayerAffiliateUrl(tcgPlayerUrl);
  return buildTrackedUrl({
    url: affiliateUrl,
    destination: 'tcgplayer',
    cardName,
    cardId,
    sourcePage,
  });
}

export function buildTrackedTcgPlayerSearchUrl(
  cardName: string,
  sourcePage: string,
  cardId?: string,
): string {
  const searchUrl = buildTcgPlayerSearchUrl(cardName);
  return buildTrackedUrl({
    url: searchUrl,
    destination: 'tcgplayer',
    cardName,
    cardId,
    sourcePage,
  });
}
