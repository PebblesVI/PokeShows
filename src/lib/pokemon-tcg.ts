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

export async function getTotalCardCount(): Promise<number> {
  const response = await fetch(`${API_BASE}/cards?pageSize=1&select=id`, {
    headers: getHeaders(),
    next: { revalidate: 86400 },
  });
  const data: ApiResponse = await response.json();
  return data.totalCount;
}

export async function getRandomCard(): Promise<PokemonTcgCard> {
  const totalCount = await getTotalCardCount();
  const randomPage = Math.floor(Math.random() * totalCount) + 1;

  const response = await fetch(
    `${API_BASE}/cards?page=${randomPage}&pageSize=1`,
    { headers: getHeaders() }
  );
  const data: ApiResponse = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error('No card returned from API');
  }

  return data.data[0];
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
