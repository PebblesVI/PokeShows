import type { MetadataRoute } from 'next';
import { db } from '@/db';
import { shows, cardOfTheDay } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { US_STATE_NAMES, SHOP_CATEGORIES } from '@/lib/constants';
import { getAllPosts } from '@/lib/blog/posts';
import { cardToSlug } from '@/lib/card-slug';
import { getAllSets } from '@/lib/pokemon-tcg';
import { TOP_METROS } from '@/lib/metros';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/shows`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/shows/this-weekend`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/card-of-the-day`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/buy`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/buy/sets`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/buy/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${siteUrl}/shop`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Buy category pages
  const buyCategoryPages: MetadataRoute.Sitemap = SHOP_CATEGORIES.map(cat => ({
    url: `${siteUrl}/buy/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = getAllPosts().map(post => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const statePages: MetadataRoute.Sitemap = Object.keys(US_STATE_NAMES).map(state => ({
    url: `${siteUrl}/shows/state/${state.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Set pages from Pokemon TCG API
  let setPages: MetadataRoute.Sitemap = [];
  try {
    const sets = await getAllSets();
    setPages = sets.map(set => ({
      url: `${siteUrl}/buy/set/${set.id}`,
      lastModified: new Date(set.releaseDate || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // API may not be available during build
  }

  // Metro pages
  const metroPages: MetadataRoute.Sitemap = TOP_METROS.map(metro => ({
    url: `${siteUrl}/shows/metro/${metro.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Feed and LLM pages
  const feedPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/feed.xml`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.3 },
    { url: `${siteUrl}/llms.txt`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.3 },
  ];

  let showPages: MetadataRoute.Sitemap = [];
  let cityPages: MetadataRoute.Sitemap = [];
  let buyCardPages: MetadataRoute.Sitemap = [];
  try {
    const allShows = await db.select({ slug: shows.slug, updatedAt: shows.updatedAt })
      .from(shows)
      .where(eq(shows.isActive, true));

    showPages = allShows.map(show => ({
      url: `${siteUrl}/shows/${show.slug}`,
      lastModified: new Date(show.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // City pages from unique city+state combos
    const cities = await db.selectDistinct({ city: shows.city, state: shows.state })
      .from(shows)
      .where(eq(shows.isActive, true));

    cityPages = cities.map(({ city, state }) => ({
      url: `${siteUrl}/shows/city/${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // Buy card pages from Card of the Day history
    const recentCards = await db.select({
      cardName: cardOfTheDay.cardName,
      setName: cardOfTheDay.setName,
      featuredDate: cardOfTheDay.featuredDate,
    })
      .from(cardOfTheDay)
      .orderBy(desc(cardOfTheDay.featuredDate))
      .limit(50);

    buyCardPages = recentCards.map(card => ({
      url: `${siteUrl}/buy/${cardToSlug(card.cardName, card.setName)}`,
      lastModified: new Date(card.featuredDate),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // DB may not be available during build
  }

  return [
    ...staticPages,
    ...buyCategoryPages,
    ...setPages,
    ...blogPages,
    ...statePages,
    ...metroPages,
    ...cityPages,
    ...showPages,
    ...buyCardPages,
    ...feedPages,
  ];
}
