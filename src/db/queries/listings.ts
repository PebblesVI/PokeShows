import { db } from '@/db';
import { ebayListings, cardOfTheDay } from '@/db/schema';
import { eq, lt, desc, sql, and } from 'drizzle-orm';
import type { EbayListing } from '@/lib/ebay-api';

export async function getListingsByCardSlug(cardSlug: string, limit = 20) {
  return db.select()
    .from(ebayListings)
    .where(eq(ebayListings.cardSlug, cardSlug))
    .orderBy(desc(ebayListings.fetchedAt))
    .limit(limit);
}

export async function getListingsByCategory(categorySlug: string, limit = 20) {
  return db.select()
    .from(ebayListings)
    .where(eq(ebayListings.categorySlug, categorySlug))
    .orderBy(desc(ebayListings.fetchedAt))
    .limit(limit);
}

export async function upsertListings(
  listings: EbayListing[],
  meta: { searchQuery: string; categorySlug?: string; cardSlug?: string }
) {
  const now = new Date().toISOString();

  for (const listing of listings) {
    await db.insert(ebayListings)
      .values({
        searchQuery: meta.searchQuery,
        ebayItemId: listing.itemId,
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        imageUrl: listing.imageUrl,
        itemUrl: listing.itemUrl,
        condition: listing.condition,
        seller: listing.seller,
        listingType: listing.listingType,
        endTime: listing.endTime,
        categorySlug: meta.categorySlug ?? null,
        cardSlug: meta.cardSlug ?? null,
        fetchedAt: now,
      })
      .onConflictDoUpdate({
        target: ebayListings.ebayItemId,
        set: {
          title: listing.title,
          price: listing.price,
          imageUrl: listing.imageUrl,
          condition: listing.condition,
          seller: listing.seller,
          listingType: listing.listingType,
          endTime: listing.endTime,
          fetchedAt: now,
        },
      });
  }
}

export async function purgeStaleListings(maxAgeHours = 24) {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();
  return db.delete(ebayListings)
    .where(lt(ebayListings.fetchedAt, cutoff));
}

export async function getPopularCardSearches(limit = 12) {
  return db.select({
    cardName: cardOfTheDay.cardName,
    setName: cardOfTheDay.setName,
    pokemonTcgId: cardOfTheDay.pokemonTcgId,
    imageSmall: cardOfTheDay.imageSmall,
    tcgPlayerPrice: cardOfTheDay.tcgPlayerPrice,
    rarity: cardOfTheDay.rarity,
  })
    .from(cardOfTheDay)
    .orderBy(desc(cardOfTheDay.featuredDate))
    .limit(limit);
}

export async function getListingCount() {
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(ebayListings);
  return result[0]?.count ?? 0;
}

export async function getCategoryListingCounts() {
  return db.select({
    categorySlug: ebayListings.categorySlug,
    count: sql<number>`count(*)`,
  })
    .from(ebayListings)
    .where(sql`${ebayListings.categorySlug} IS NOT NULL`)
    .groupBy(ebayListings.categorySlug);
}
