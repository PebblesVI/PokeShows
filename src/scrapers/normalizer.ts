import slugify from 'slugify';
import type { ScrapedShow } from './base-scraper';

/**
 * Trims all string fields and normalizes the state code to uppercase.
 */
export function normalizeShow(show: ScrapedShow): ScrapedShow {
  const trimmed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(show)) {
    if (typeof value === 'string') {
      trimmed[key] = value.trim();
    } else {
      trimmed[key] = value;
    }
  }

  return {
    ...show,
    ...trimmed,
    state: (trimmed['state'] as string).toUpperCase(),
  } as ScrapedShow;
}

/**
 * Generates a URL-friendly slug from the show name, date, and city.
 * Includes city to avoid collisions for recurring shows across locations.
 * Example: "Big Card Show" in "Dallas" on "2026-03-14" => "big-card-show-2026-03-14-dallas"
 */
export function generateSlug(show: ScrapedShow): string {
  const nameSlug = slugify(show.name, { lower: true, strict: true });
  const citySlug = slugify(show.city, { lower: true, strict: true });
  return `${nameSlug}-${show.startDate}-${citySlug}`;
}

/**
 * Builds a dedup key from lowercased name + startDate + city + state.
 */
function dedupKey(show: ScrapedShow): string {
  return [
    show.name.toLowerCase().trim(),
    show.startDate,
    show.city.toLowerCase().trim(),
    show.state.toUpperCase().trim(),
  ].join('|');
}

/**
 * Deduplicates shows by (lowercased name + startDate + city + state).
 * When duplicates are found, optional fields from later entries are merged
 * into the first occurrence, preferring non-empty values.
 */
export function deduplicateShows(shows: ScrapedShow[]): ScrapedShow[] {
  const seen = new Map<string, ScrapedShow>();

  for (const show of shows) {
    const key = dedupKey(show);
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, { ...show });
    } else {
      // Merge optional fields: prefer existing non-empty values,
      // but fill in any fields that are missing from the earlier entry.
      const merged = { ...existing };
      const optionalFields: (keyof ScrapedShow)[] = [
        'description',
        'venueName',
        'address',
        'zipCode',
        'endDate',
        'startTime',
        'endTime',
        'admissionPrice',
        'organizerName',
        'websiteUrl',
        'imageUrl',
        'sourceUrl',
      ];

      for (const field of optionalFields) {
        if (!merged[field] && show[field]) {
          (merged as Record<string, unknown>)[field] = show[field];
        }
      }

      // If one source marks it as pokemon-specific, keep that
      if (show.isPokemonSpecific && !merged.isPokemonSpecific) {
        merged.isPokemonSpecific = true;
      }

      seen.set(key, merged);
    }
  }

  return Array.from(seen.values());
}
