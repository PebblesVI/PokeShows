interface EbayLinkParams {
  searchQuery: string;
  category?: string;
  customId?: string;
}

export function buildEbaySearchUrl({ searchQuery, category, customId }: EbayLinkParams): string {
  const campaignId = process.env.EBAY_CAMPAIGN_ID || 'REPLACE_WITH_YOUR_CAMPAIGN_ID';
  const baseCustomId = process.env.EBAY_CUSTOM_ID || 'pokeshows';
  const fullCustomId = customId ? `${baseCustomId}-${customId}` : baseCustomId;

  const params = new URLSearchParams({
    _nkw: searchQuery,
    mkcid: '1',
    mkrid: '711-53200-19255-0',
    campid: campaignId,
    toolid: '10001',
    customid: fullCustomId,
    mkevt: '1',
  });

  if (category) {
    params.set('_sacat', category);
  }

  return `https://www.ebay.com/sch/i.html?${params.toString()}`;
}

export function buildEbayItemUrl(itemUrl: string, customId?: string): string {
  const campaignId = process.env.EBAY_CAMPAIGN_ID || 'REPLACE_WITH_YOUR_CAMPAIGN_ID';
  const baseCustomId = process.env.EBAY_CUSTOM_ID || 'pokeshows';
  const fullCustomId = customId ? `${baseCustomId}-${customId}` : baseCustomId;

  const url = new URL(itemUrl);
  url.searchParams.set('mkcid', '1');
  url.searchParams.set('mkrid', '711-53200-19255-0');
  url.searchParams.set('campid', campaignId);
  url.searchParams.set('toolid', '10001');
  url.searchParams.set('customid', fullCustomId);
  url.searchParams.set('mkevt', '1');

  return url.toString();
}
