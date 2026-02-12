const API_BASE = 'https://api.pokemontcg.io/v2';

export interface PokemonTcgCard {
  id: string;
  name: string;
  images: { small: string; large: string };
  set: { name: string; series: string };
  rarity: string | null;
  artist: string | null;
  number: string;
  types: string[] | null;
  hp: string | null;
  flavorText: string | null;
  tcgplayer?: {
    url: string;
    prices?: Record<string, {
      low?: number;
      mid?: number;
      high?: number;
      market?: number;
      directLow?: number;
    }>;
  };
}

interface ApiResponse {
  data: PokemonTcgCard[];
  totalCount: number;
  count: number;
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (process.env.POKEMON_TCG_API_KEY) {
    headers['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY;
  }
  return headers;
}

// Module-level cache for card counts (refreshes once per server restart / ~1h on serverless)
let cachedTotalCount: number | null = null;
let cachedHoloCount: number | null = null;
let countCacheTime = 0;
const COUNT_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

async function getCachedTotalCount(): Promise<number> {
  if (cachedTotalCount && Date.now() - countCacheTime < COUNT_CACHE_TTL) {
    return cachedTotalCount;
  }
  const response = await fetch(`${API_BASE}/cards?pageSize=1&select=id`, {
    headers: getHeaders(),
  });
  const data: ApiResponse = await response.json();
  cachedTotalCount = data.totalCount;
  countCacheTime = Date.now();
  return cachedTotalCount;
}

const HOLO_QUERY = 'rarity:"Rare Holo" OR rarity:"Rare Holo EX" OR rarity:"Rare Holo GX" OR rarity:"Rare Holo V" OR rarity:"Rare Holo VMAX" OR rarity:"Rare Holo VSTAR"';

async function getCachedHoloCount(): Promise<number> {
  if (cachedHoloCount && Date.now() - countCacheTime < COUNT_CACHE_TTL) {
    return cachedHoloCount;
  }
  const params = new URLSearchParams({ q: HOLO_QUERY, pageSize: '1', select: 'id' });
  const response = await fetch(`${API_BASE}/cards?${params}`, {
    headers: getHeaders(),
  });
  const data: ApiResponse = await response.json();
  cachedHoloCount = data.totalCount;
  return cachedHoloCount;
}

export async function getTotalCardCount(): Promise<number> {
  return getCachedTotalCount();
}

export async function getRandomCard(): Promise<PokemonTcgCard> {
  const totalCount = await getCachedTotalCount();
  // Fetch a batch of 25 from a random page, then pick one — single API call for card data
  const totalPages = Math.ceil(totalCount / 25);
  const randomPage = Math.floor(Math.random() * totalPages) + 1;

  const response = await fetch(
    `${API_BASE}/cards?page=${randomPage}&pageSize=25`,
    { headers: getHeaders() }
  );
  const data: ApiResponse = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error('No card returned from API');
  }

  return data.data[Math.floor(Math.random() * data.data.length)];
}

export async function getCardById(id: string): Promise<PokemonTcgCard> {
  const response = await fetch(`${API_BASE}/cards/${id}`, {
    headers: getHeaders(),
    next: { revalidate: 86400 },
  });
  const data = await response.json();
  return data.data;
}

export async function searchCards(query: string, limit = 20): Promise<{ cards: PokemonTcgCard[]; totalCount: number }> {
  const params = new URLSearchParams({
    q: `name:"${query}*"`,
    pageSize: String(limit),
    orderBy: '-tcgplayer.prices.holofoil.market',
  });

  const response = await fetch(`${API_BASE}/cards?${params}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return { cards: [], totalCount: 0 };
  }

  const data: ApiResponse = await response.json();
  return { cards: data.data || [], totalCount: data.totalCount };
}

export interface PokemonTcgSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  images: { symbol: string; logo: string };
}

interface SetApiResponse {
  data: PokemonTcgSet[];
  totalCount: number;
}

export async function getAllSets(): Promise<PokemonTcgSet[]> {
  const response = await fetch(`${API_BASE}/sets?orderBy=-releaseDate&pageSize=250`, {
    headers: getHeaders(),
    next: { revalidate: 86400 },
  });

  if (!response.ok) return [];

  const data: SetApiResponse = await response.json();
  return data.data || [];
}

export async function getSetById(setId: string): Promise<PokemonTcgSet | null> {
  const response = await fetch(`${API_BASE}/sets/${setId}`, {
    headers: getHeaders(),
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.data || null;
}

export async function getCardsBySet(setId: string, limit = 50): Promise<PokemonTcgCard[]> {
  const params = new URLSearchParams({
    q: `set.id:"${setId}"`,
    pageSize: String(limit),
    orderBy: 'number',
  });

  const response = await fetch(`${API_BASE}/cards?${params}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [];

  const data: ApiResponse = await response.json();
  return data.data || [];
}

export async function getRandomHoloCard(): Promise<PokemonTcgCard> {
  const totalCount = await getCachedHoloCount();

  if (totalCount === 0) {
    throw new Error('No holo cards found');
  }

  const totalPages = Math.ceil(totalCount / 25);
  const randomPage = Math.floor(Math.random() * totalPages) + 1;
  const params = new URLSearchParams({
    q: HOLO_QUERY,
    page: String(randomPage),
    pageSize: '25',
  });

  const response = await fetch(`${API_BASE}/cards?${params}`, {
    headers: getHeaders(),
  });
  const data: ApiResponse = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error('No holo card returned from API');
  }

  return data.data[Math.floor(Math.random() * data.data.length)];
}
