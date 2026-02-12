import * as cheerio from 'cheerio';
import { BaseScraper, scrapedShowSchema, type ScrapedShow } from './base-scraper';

/**
 * Search queries to find card shows on Eventbrite.
 * Uses the website's search pages since the search API was deprecated.
 */
const SEARCH_QUERIES = [
  'pokemon-card-show',
  'trading-card-show',
  'pokemon-card-event',
  'tcg-tournament',
  'pokemon-tournament',
  'card-show-pokemon',
  'trading-card-convention',
  'pokemon-convention',
  'card-collectors-show',
];

const BASE_URL = 'https://www.eventbrite.com/d/united-states';

interface EventbriteVenue {
  id?: string;
  name?: string;
  address?: {
    address_1?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  };
}

interface EventbriteTicketClass {
  cost?: { display?: string; value?: number };
  free?: boolean;
  name?: string;
}

interface EventbriteEvent {
  name?: string;
  eid?: string;
  eventbrite_event_id?: string;
  url?: string;
  summary?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_online_event?: boolean;
  is_free?: boolean;
  primary_venue?: EventbriteVenue;
  primary_organizer?: { name?: string };
  primary_organizer_id?: string;
  image?: { url?: string };
  tickets_url?: string;
  ticket_classes?: EventbriteTicketClass[];
  ticket_availability?: { minimum_ticket_price?: { display?: string; value?: number }; is_free?: boolean };
}

const POKEMON_KEYWORDS = /pok[eé]mon|pikachu|charizard|tcg\b|pokeshows/i;
const CARD_SHOW_KEYWORDS = /card\s*show|trading\s*card|card\s*convention|card\s*expo|collectors?\s*show|card\s*fair|card\s*meet/i;

// Valid US state codes for filtering
const US_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
]);

export class EventbriteScraper extends BaseScraper {
  readonly sourceName = 'eventbrite';

  /**
   * Extract event data from the window.__SERVER_DATA__ script tag.
   */
  private extractEvents(html: string): EventbriteEvent[] {
    const $ = cheerio.load(html);
    const events: EventbriteEvent[] = [];

    // Look for __SERVER_DATA__ in script tags
    $('script').each((_i, el) => {
      const content = $(el).html() || '';
      if (!content.includes('__SERVER_DATA__')) return;

      try {
        // Extract the JSON object from: window.__SERVER_DATA__ = {...};
        const match = content.match(/window\.__SERVER_DATA__\s*=\s*(\{[\s\S]*?\});?\s*(?:$|<\/script)/);
        if (!match) return;

        const data = JSON.parse(match[1]);

        // Navigate to events — structure may vary
        const searchData = data?.search_data || data?.jsonBody?.search_data;
        const results =
          searchData?.events?.results ||
          searchData?.events ||
          data?.events?.results ||
          [];

        if (Array.isArray(results)) {
          events.push(...results);
        }
      } catch {
        // JSON parse failed — try a more lenient approach
      }
    });

    // Fallback: try to find events in any large JSON blob
    if (events.length === 0) {
      $('script[type="application/ld+json"]').each((_i, el) => {
        try {
          const jsonLd = JSON.parse($(el).html() || '');
          if (Array.isArray(jsonLd)) {
            for (const item of jsonLd) {
              if (item['@type'] === 'Event') {
                events.push({
                  name: item.name,
                  eid: item.url?.match(/(\d+)$/)?.[1],
                  url: item.url,
                  summary: item.description,
                  start_date: item.startDate?.split('T')[0],
                  end_date: item.endDate?.split('T')[0],
                  primary_venue: item.location ? {
                    name: item.location.name,
                    address: {
                      address_1: item.location.address?.streetAddress,
                      city: item.location.address?.addressLocality,
                      region: item.location.address?.addressRegion,
                      postal_code: item.location.address?.postalCode,
                      country: item.location.address?.addressCountry,
                    },
                  } : undefined,
                  image: item.image ? { url: Array.isArray(item.image) ? item.image[0] : item.image } : undefined,
                });
              }
            }
          }
        } catch {
          // ignore
        }
      });
    }

    return events;
  }

  /**
   * Determines if an event is relevant (card show / Pokemon related).
   */
  private isRelevantEvent(event: EventbriteEvent): boolean {
    const text = `${event.name || ''} ${event.summary || ''}`;
    return CARD_SHOW_KEYWORDS.test(text) || POKEMON_KEYWORDS.test(text);
  }

  /**
   * Determines if an event is specifically Pokemon-related.
   */
  private isPokemonEvent(event: EventbriteEvent): boolean {
    const text = `${event.name || ''} ${event.summary || ''}`;
    return POKEMON_KEYWORDS.test(text);
  }

  /**
   * Determines the event type based on name and description.
   */
  private getEventType(event: EventbriteEvent): 'card_show' | 'convention' | 'tournament' | 'meetup' {
    const text = `${event.name || ''} ${event.summary || ''}`.toLowerCase();
    if (/tournament|compete|competition|league/i.test(text)) return 'tournament';
    if (/convention|con\b|expo|conference/i.test(text)) return 'convention';
    if (/meetup|meet[\s-]?up|gathering|hangout/i.test(text)) return 'meetup';
    return 'card_show';
  }

  /**
   * Extracts admission price from Eventbrite event data.
   */
  private extractPrice(event: EventbriteEvent): string | undefined {
    // Check is_free flag
    if (event.is_free || event.ticket_availability?.is_free) {
      return 'Free';
    }

    // Check ticket_availability for minimum price
    if (event.ticket_availability?.minimum_ticket_price?.display) {
      return event.ticket_availability.minimum_ticket_price.display;
    }

    // Check ticket_classes for the lowest price
    if (event.ticket_classes && event.ticket_classes.length > 0) {
      const prices: number[] = [];
      for (const tc of event.ticket_classes) {
        if (tc.free) return 'Free';
        if (tc.cost?.value) prices.push(tc.cost.value);
      }
      if (prices.length > 0) {
        const lowest = Math.min(...prices);
        // Eventbrite stores cents in some cases
        const dollars = lowest >= 100 ? (lowest / 100).toFixed(2) : lowest.toFixed(2);
        return `$${dollars}`;
      }
    }

    return undefined;
  }

  /**
   * Convert an Eventbrite event to our ScrapedShow schema.
   */
  private toScrapedShow(event: EventbriteEvent): ScrapedShow | null {
    const venue = event.primary_venue;
    const addr = venue?.address;

    // Must have name, start date, city, and state
    if (!event.name || !event.start_date) return null;
    if (!addr?.city || !addr?.region) return null;

    // Must be a US state
    const stateCode = addr.region.toUpperCase();
    if (!US_STATE_CODES.has(stateCode)) return null;

    // Skip online events
    if (event.is_online_event) return null;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event.start_date)) return null;

    const eventId = event.eid || event.eventbrite_event_id || '';
    if (!eventId) return null;

    const raw: ScrapedShow = {
      name: event.name.trim(),
      description: event.summary?.trim(),
      venueName: venue?.name?.trim(),
      address: addr.address_1?.trim(),
      city: addr.city.trim(),
      state: stateCode,
      zipCode: addr.postal_code?.trim(),
      startDate: event.start_date,
      endDate: event.end_date && /^\d{4}-\d{2}-\d{2}$/.test(event.end_date) ? event.end_date : undefined,
      startTime: event.start_time,
      endTime: event.end_time,
      admissionPrice: this.extractPrice(event),
      eventType: this.getEventType(event),
      isPokemonSpecific: this.isPokemonEvent(event),
      sourceId: `eb-${eventId}`,
      sourceName: this.sourceName,
      sourceUrl: event.url,
      websiteUrl: event.url,
      imageUrl: event.image?.url,
    };

    const result = scrapedShowSchema.safeParse(raw);
    if (!result.success) {
      console.warn(`[eventbrite] Validation failed for "${event.name}":`, result.error.format());
      return null;
    }

    return result.data;
  }

  /**
   * Fetch a single search results page and extract events.
   */
  private async fetchSearchPage(query: string, page = 1): Promise<EventbriteEvent[]> {
    const url = page > 1
      ? `${BASE_URL}/${query}/?page=${page}`
      : `${BASE_URL}/${query}/`;

    try {
      const html = await this.fetchPage(url);
      return this.extractEvents(html);
    } catch (error) {
      console.warn(`[eventbrite] Failed to fetch "${query}" page ${page}:`, error);
      return [];
    }
  }

  async scrape(): Promise<ScrapedShow[]> {
    console.log('[eventbrite] Starting Eventbrite scraper...');
    const seenIds = new Set<string>();
    const allShows: ScrapedShow[] = [];

    for (const query of SEARCH_QUERIES) {
      console.log(`[eventbrite] Searching: ${query}`);

      // Fetch first page
      const events = await this.fetchSearchPage(query);
      console.log(`[eventbrite]   "${query}" page 1: ${events.length} raw events`);

      for (const event of events) {
        if (!this.isRelevantEvent(event)) continue;

        const show = this.toScrapedShow(event);
        if (!show) continue;

        if (seenIds.has(show.sourceId)) continue;
        seenIds.add(show.sourceId);

        allShows.push(show);
      }

      // If first page had results, try page 2
      if (events.length >= 10) {
        await this.delay(2000);
        const page2Events = await this.fetchSearchPage(query, 2);
        console.log(`[eventbrite]   "${query}" page 2: ${page2Events.length} raw events`);

        for (const event of page2Events) {
          if (!this.isRelevantEvent(event)) continue;

          const show = this.toScrapedShow(event);
          if (!show) continue;

          if (seenIds.has(show.sourceId)) continue;
          seenIds.add(show.sourceId);

          allShows.push(show);
        }
      }

      // Rate limit between queries
      await this.delay(2000);
    }

    console.log(`[eventbrite] Total shows found: ${allShows.length}`);
    return allShows;
  }
}
