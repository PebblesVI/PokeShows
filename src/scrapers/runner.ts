import { db } from '@/db';
import { shows, scraperRuns } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { US_STATE_NAMES } from '@/lib/constants';
import { type ScrapedShow } from './base-scraper';
import { normalizeShow, generateSlug, deduplicateShows } from './normalizer';
import { TcdbScraper } from './tcdb-scraper';
import { CollectaConScraper } from './collectacon-scraper';
import { FlippinScraper } from './flippin-scraper';
import { CardPartyScraper } from './card-party-scraper';
import { TxCardShowsScraper } from './tx-card-shows-scraper';
import { PokemonEventsScraper } from './pokemon-events-scraper';
import { EventbriteScraper } from './eventbrite-scraper';
import { SeedScraper } from './seed-scraper';

interface ScraperResult {
  total: number;
  created: number;
  updated: number;
}

/**
 * Runs all scrapers sequentially, deduplicates the combined results,
 * and upserts them into the shows database table.
 */
export async function runAllScrapers(): Promise<ScraperResult> {
  console.log('[runner] Starting scraper pipeline...');
  const startTime = Date.now();

  const scrapers = [
    new SeedScraper(),
    new EventbriteScraper(),
    new CardPartyScraper(),
    new TxCardShowsScraper(),
    new TcdbScraper(),
    new CollectaConScraper(),
    new FlippinScraper(),
    new PokemonEventsScraper(),
  ];

  const allShows: ScrapedShow[] = [];

  // Run each scraper sequentially and log the run
  for (const scraper of scrapers) {
    const scraperStart = Date.now();
    let status = 'success';
    let showsFound = 0;
    let errorMessage: string | null = null;

    try {
      console.log(`[runner] Running ${scraper.sourceName} scraper...`);
      const scraperShows = await scraper.scrape();
      showsFound = scraperShows.length;

      // Normalize all scraped shows
      const normalized = scraperShows.map(normalizeShow);
      allShows.push(...normalized);

      console.log(`[runner] ${scraper.sourceName}: found ${showsFound} shows`);
    } catch (error) {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[runner] ${scraper.sourceName} failed:`, errorMessage);
    }

    const durationMs = Date.now() - scraperStart;

    // Log the scraper run to the database
    try {
      await db.insert(scraperRuns).values({
        scraperName: scraper.sourceName,
        status,
        showsFound,
        errorMessage,
        durationMs,
      });
    } catch (logError) {
      console.error(`[runner] Failed to log scraper run for ${scraper.sourceName}:`, logError);
    }
  }

  // Deduplicate combined results across all scrapers
  console.log(`[runner] Total raw shows before dedup: ${allShows.length}`);
  const deduplicated = deduplicateShows(allShows);
  console.log(`[runner] Shows after dedup: ${deduplicated.length}`);

  // Upsert into the shows table
  let created = 0;
  let updated = 0;

  for (const show of deduplicated) {
    try {
      const slug = generateSlug(show);
      const stateFullName = US_STATE_NAMES[show.state] || show.state;
      const now = new Date().toISOString();

      // Check if a show with this sourceName + sourceId already exists
      const existing = await db.select()
        .from(shows)
        .where(
          and(
            eq(shows.sourceName, show.sourceName),
            eq(shows.sourceId, show.sourceId),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing show
        await db.update(shows)
          .set({
            name: show.name,
            description: show.description || existing[0].description,
            venueName: show.venueName || existing[0].venueName,
            address: show.address || existing[0].address,
            city: show.city,
            state: show.state,
            stateFullName,
            zipCode: show.zipCode || existing[0].zipCode,
            startDate: show.startDate,
            endDate: show.endDate || existing[0].endDate,
            startTime: show.startTime || existing[0].startTime,
            endTime: show.endTime || existing[0].endTime,
            admissionPrice: show.admissionPrice || existing[0].admissionPrice,
            organizerName: show.organizerName || existing[0].organizerName,
            websiteUrl: show.websiteUrl || existing[0].websiteUrl,
            imageUrl: show.imageUrl || existing[0].imageUrl,
            eventType: show.eventType,
            isPokemonSpecific: show.isPokemonSpecific,
            sourceUrl: show.sourceUrl || existing[0].sourceUrl,
            updatedAt: now,
            lastScrapedAt: now,
            isActive: true,
          })
          .where(eq(shows.id, existing[0].id));

        updated++;
      } else {
        // Insert new show
        await db.insert(shows).values({
          slug,
          name: show.name,
          description: show.description,
          venueName: show.venueName,
          address: show.address,
          city: show.city,
          state: show.state,
          stateFullName,
          zipCode: show.zipCode,
          startDate: show.startDate,
          endDate: show.endDate,
          startTime: show.startTime,
          endTime: show.endTime,
          admissionPrice: show.admissionPrice,
          organizerName: show.organizerName,
          websiteUrl: show.websiteUrl,
          imageUrl: show.imageUrl,
          eventType: show.eventType,
          isPokemonSpecific: show.isPokemonSpecific,
          sourceId: show.sourceId,
          sourceName: show.sourceName,
          sourceUrl: show.sourceUrl,
          lastScrapedAt: now,
          isActive: true,
        });

        created++;
      }
    } catch (error) {
      console.error(`[runner] Failed to upsert show "${show.name}":`, error);
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log(
    `[runner] Pipeline complete in ${totalDuration}ms. ` +
    `Total: ${deduplicated.length}, Created: ${created}, Updated: ${updated}`,
  );

  return {
    total: deduplicated.length,
    created,
    updated,
  };
}
