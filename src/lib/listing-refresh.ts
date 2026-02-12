import { searchEbayListings, isEbayApiConfigured } from '@/lib/ebay-api';
import {
  getListingsByCategory,
  getListingsByCardSlug,
  getCategoryFreshness,
  getCardSlugFreshness,
  upsertListings,
} from '@/db/queries/listings';
import { SHOP_CATEGORIES } from '@/lib/constants';

const STALE_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Get listings for a category, refreshing on-demand if stale or empty.
 */
export async function getFreshCategoryListings(categorySlug: string, limit = 20) {
  const freshness = await getCategoryFreshness(categorySlug);
  const isStale = freshness === null || freshness > STALE_THRESHOLD_MS;

  if (isStale && isEbayApiConfigured()) {
    const category = SHOP_CATEGORIES.find(c => c.slug === categorySlug);
    if (category) {
      try {
        const listings = await searchEbayListings({
          query: category.searchQuery,
          categoryId: category.ebayCategory,
          limit: 20,
          sort: 'newlyListed',
        });

        if (listings.length > 0) {
          await upsertListings(listings, {
            searchQuery: category.searchQuery,
            categorySlug: category.slug,
          });
        }
      } catch (error) {
        console.error(`[listing-refresh] On-demand refresh failed for ${categorySlug}:`, error);
      }
    }
  }

  return getListingsByCategory(categorySlug, limit);
}

/**
 * Get listings for a card slug, refreshing on-demand if stale or empty.
 */
export async function getFreshCardListings(
  cardSlug: string,
  searchQuery: string,
  limit = 20,
) {
  const freshness = await getCardSlugFreshness(cardSlug);
  const isStale = freshness === null || freshness > STALE_THRESHOLD_MS;

  if (isStale && isEbayApiConfigured()) {
    try {
      const listings = await searchEbayListings({
        query: searchQuery,
        limit: 10,
      });

      if (listings.length > 0) {
        await upsertListings(listings, {
          searchQuery,
          cardSlug,
        });
      }
    } catch (error) {
      console.error(`[listing-refresh] On-demand refresh failed for ${cardSlug}:`, error);
    }
  }

  return getListingsByCardSlug(cardSlug, limit);
}
