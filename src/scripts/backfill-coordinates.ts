/**
 * One-time script to backfill latitude/longitude for all shows
 * based on the city-coordinates lookup.
 *
 * Run: npx tsx src/scripts/backfill-coordinates.ts
 */
import { db } from '@/db';
import { shows } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { getCityCoordinates } from '@/lib/city-coordinates';

async function backfill() {
  console.log('Backfilling coordinates for shows...');

  const allShows = await db.select({
    id: shows.id,
    city: shows.city,
    state: shows.state,
    latitude: shows.latitude,
    longitude: shows.longitude,
  })
    .from(shows)
    .where(isNull(shows.latitude));

  console.log(`Found ${allShows.length} shows without coordinates`);

  let updated = 0;
  let notFound = 0;

  for (const show of allShows) {
    const coords = getCityCoordinates(show.city, show.state);
    if (coords) {
      await db.update(shows)
        .set({
          latitude: coords.lat,
          longitude: coords.lng,
        })
        .where(eq(shows.id, show.id));
      updated++;
    } else {
      notFound++;
      if (notFound <= 20) {
        console.log(`  No coordinates for: ${show.city}, ${show.state}`);
      }
    }
  }

  console.log(`Done! Updated: ${updated}, Not found: ${notFound}`);
}

backfill().catch(console.error);
