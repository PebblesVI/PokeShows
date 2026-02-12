const EBAY_AUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const EBAY_BROWSE_URL = 'https://api.ebay.com/buy/browse/v1';

interface EbayToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: EbayToken | null = null;

function isConfigured(): boolean {
  return !!(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string | null> {
  if (!isConfigured()) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(EBAY_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  });

  if (!response.ok) {
    console.error('eBay OAuth failed:', response.status, await response.text());
    return null;
  }

  const data = await response.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

export interface EbayListing {
  itemId: string;
  title: string;
  price: number | null;
  currency: string;
  imageUrl: string | null;
  itemUrl: string;
  condition: string | null;
  seller: string | null;
  listingType: string | null;
  endTime: string | null;
}

interface EbaySearchOptions {
  query: string;
  categoryId?: string;
  limit?: number;
  sort?: 'price' | '-price' | 'newlyListed' | 'endingSoonest';
  minPrice?: number;
  maxPrice?: number;
}

interface BrowseApiItem {
  itemId: string;
  title: string;
  price?: { value: string; currency: string };
  image?: { imageUrl: string };
  itemWebUrl: string;
  condition: string;
  seller?: { username: string };
  buyingOptions?: string[];
  itemEndDate?: string;
}

interface BrowseApiResponse {
  total: number;
  itemSummaries?: BrowseApiItem[];
}

export async function searchEbayListings(options: EbaySearchOptions): Promise<EbayListing[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const params = new URLSearchParams({
    q: options.query,
    limit: String(options.limit || 20),
  });

  if (options.categoryId) {
    params.set('category_ids', options.categoryId);
  }

  if (options.sort) {
    params.set('sort', options.sort);
  }

  const filters: string[] = [];
  if (options.minPrice != null) {
    filters.push(`price:[${options.minPrice}..],priceCurrency:USD`);
  }
  if (options.maxPrice != null) {
    filters.push(`price:[..${options.maxPrice}],priceCurrency:USD`);
  }
  if (filters.length > 0) {
    params.set('filter', filters.join(','));
  }

  try {
    const response = await fetch(`${EBAY_BROWSE_URL}/item_summary/search?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('eBay Browse API error:', response.status);
      return [];
    }

    const data: BrowseApiResponse = await response.json();
    if (!data.itemSummaries) return [];

    return data.itemSummaries.map((item) => ({
      itemId: item.itemId,
      title: item.title,
      price: item.price ? parseFloat(item.price.value) : null,
      currency: item.price?.currency || 'USD',
      imageUrl: item.image?.imageUrl?.replace('s-l225.jpg', 's-l500.jpg') || null,
      itemUrl: item.itemWebUrl,
      condition: item.condition || null,
      seller: item.seller?.username || null,
      listingType: item.buyingOptions?.join(',') || null,
      endTime: item.itemEndDate || null,
    }));
  } catch (error) {
    console.error('eBay search failed:', error);
    return [];
  }
}

export function isEbayApiConfigured(): boolean {
  return isConfigured();
}
