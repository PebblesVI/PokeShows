import { NextResponse } from 'next/server';
import { searchEbayListings, isEbayApiConfigured } from '@/lib/ebay-api';
import { upsertListings, purgeStaleListings, getPopularCardSearches } from '@/db/queries/listings';
import { SHOP_CATEGORIES } from '@/lib/constants';
import { cardToSlug } from '@/lib/card-slug';

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isEbayApiConfigured()) {
    return NextResponse.json({
      status: 'skipped',
      message: 'eBay API not configured. Set EBAY_CLIENT_ID and EBAY_CLIENT_SECRET.',
    });
  }

  const results: { query: string; count: number; error?: string }[] = [];

  try {
    // 1. Purge stale listings (>24h)
    await purgeStaleListings(24);

    // 2. Refresh category listings
    for (const category of SHOP_CATEGORIES) {
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

        results.push({ query: category.searchQuery, count: listings.length });
      } catch (error) {
        results.push({
          query: category.searchQuery,
          count: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Rate limit: small delay between requests
      await new Promise(r => setTimeout(r, 500));
    }

    // 3. Refresh trending/popular card searches
    const POPULAR_SEARCHES = [
      'charizard pokemon card',
      'pikachu vmax pokemon card',
      'mewtwo pokemon card',
      'lugia pokemon card',
      'umbreon pokemon card',
      'rayquaza pokemon card',
    ];

    for (const query of POPULAR_SEARCHES) {
      try {
        const listings = await searchEbayListings({
          query,
          limit: 10,
          sort: 'newlyListed',
        });

        if (listings.length > 0) {
          await upsertListings(listings, {
            searchQuery: query,
            cardSlug: query.replace(/\s+/g, '-').toLowerCase(),
          });
        }

        results.push({ query, count: listings.length });
      } catch (error) {
        results.push({
          query,
          count: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      await new Promise(r => setTimeout(r, 500));
    }

    // 4. Refresh recent Card of the Day listings
    const recentCards = await getPopularCardSearches(6);

    for (const card of recentCards) {
      const searchQuery = `pokemon card ${card.cardName} ${card.setName}`;
      const cardSlug = cardToSlug(card.cardName, card.setName);

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

        results.push({ query: searchQuery, count: listings.length });
      } catch (error) {
        results.push({
          query: searchQuery,
          count: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      await new Promise(r => setTimeout(r, 500));
    }

    const totalListings = results.reduce((sum, r) => sum + r.count, 0);
    const errors = results.filter(r => r.error);

    return NextResponse.json({
      status: 'success',
      totalListings,
      queriesProcessed: results.length,
      errors: errors.length,
      details: results,
    });
  } catch (error) {
    console.error('Listing refresh failed:', error);
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
