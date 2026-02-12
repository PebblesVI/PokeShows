export interface Guide {
  slug: string;
  title: string;
  description: string;
  query: string;
  sortBy: string;
  limit: number;
  intro: string;
  maxPrice?: number;
}

export const GUIDES: Guide[] = [
  {
    slug: 'best-pokemon-cards-to-invest',
    title: 'Best Pokemon Cards to Invest In (2026)',
    description: 'Top Pokemon cards with the highest potential for value appreciation.',
    query: 'rarity:"Illustration Rare" OR rarity:"Special Art Rare" OR rarity:"Hyper Rare"',
    sortBy: '-tcgplayer.prices.holofoil.market',
    limit: 20,
    intro: 'Looking for Pokemon cards that hold or grow their value? These cards feature the highest market prices across modern sets and are popular among collectors and investors alike.',
  },
  {
    slug: 'best-vintage-pokemon-cards',
    title: 'Best Vintage Pokemon Cards to Collect',
    description: 'The most valuable classic Pokemon cards from Base Set, Jungle, Fossil, and more.',
    query: 'set.series:"Base" OR set.series:"Gym" OR set.series:"Neo"',
    sortBy: '-tcgplayer.prices.holofoil.market',
    limit: 20,
    intro: 'Vintage Pokemon cards from the original era remain some of the most sought-after collectibles. Here are the top vintage cards by market value.',
  },
  {
    slug: 'most-valuable-scarlet-violet-cards',
    title: 'Most Valuable Scarlet & Violet Cards',
    description: 'The highest-value cards from the Scarlet & Violet era.',
    query: 'set.series:"Scarlet & Violet"',
    sortBy: '-tcgplayer.prices.holofoil.market',
    limit: 20,
    intro: 'The Scarlet & Violet era has produced some stunning cards. These are the most valuable ones based on current TCGPlayer market prices.',
  },
  {
    slug: 'best-pokemon-cards-under-50',
    title: 'Best Pokemon Cards Under $50',
    description: 'Great Pokemon cards you can buy for under $50.',
    query: 'rarity:"Rare Holo" OR rarity:"Rare Holo V" OR rarity:"Rare Holo VSTAR"',
    sortBy: '-tcgplayer.prices.holofoil.market',
    limit: 30,
    intro: 'You don\'t need to spend hundreds to get great cards. These are the best Pokemon cards currently priced under $50.',
    maxPrice: 50,
  },
];
