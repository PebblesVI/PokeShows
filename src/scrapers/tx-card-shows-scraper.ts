import * as cheerio from 'cheerio';
import { parse, format } from 'date-fns';
import { BaseScraper, scrapedShowSchema, type ScrapedShow } from './base-scraper';

const TX_CARD_SHOWS_URL = 'https://www.txcardshows.com/';

/**
 * Seed data for known TX Card Shows events, used as a fallback when scraping fails.
 * All events are in Texas.
 */
const SEED_EVENTS: ScrapedShow[] = [
  {
    name: 'Dallas Card Show',
    description: 'Monthly sports and trading card show in the Dallas-Fort Worth metroplex. Features 100+ vendor tables with sports cards, Pokemon, and other TCG products.',
    venueName: 'Dallas Market Hall',
    address: '2200 N Stemmons Fwy',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75207',
    startDate: '2026-03-21',
    endDate: '2026-03-22',
    startTime: '09:00',
    endTime: '16:00',
    admissionPrice: '$5',
    eventType: 'card_show',
    isPokemonSpecific: false,
    sourceId: 'dallas-card-show-2026-03',
    sourceName: 'tx_card_shows',
    sourceUrl: TX_CARD_SHOWS_URL,
    websiteUrl: TX_CARD_SHOWS_URL,
  },
  {
    name: 'Houston Sports & Trading Card Show',
    description: 'One of the largest card shows in Texas. Buy, sell, and trade sports cards, Pokemon cards, and collectibles.',
    venueName: 'NRG Center',
    address: '1 NRG Park',
    city: 'Houston',
    state: 'TX',
    zipCode: '77054',
    startDate: '2026-05-09',
    endDate: '2026-05-10',
    startTime: '09:00',
    endTime: '16:00',
    admissionPrice: '$8',
    eventType: 'card_show',
    isPokemonSpecific: false,
    sourceId: 'houston-card-show-2026-05',
    sourceName: 'tx_card_shows',
    sourceUrl: TX_CARD_SHOWS_URL,
    websiteUrl: TX_CARD_SHOWS_URL,
  },
  {
    name: 'San Antonio Card & Collectibles Expo',
    description: 'Trading card show in San Antonio featuring sports cards, Pokemon, Yu-Gi-Oh, and other collectible card games. Free parking.',
    venueName: 'San Antonio Event Center',
    address: '8111 Meadow Leaf Dr',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78227',
    startDate: '2026-07-11',
    startTime: '10:00',
    endTime: '16:00',
    admissionPrice: '$5',
    eventType: 'card_show',
    isPokemonSpecific: false,
    sourceId: 'san-antonio-card-expo-2026-07',
    sourceName: 'tx_card_shows',
    sourceUrl: TX_CARD_SHOWS_URL,
    websiteUrl: TX_CARD_SHOWS_URL,
  },
];

export class TxCardShowsScraper extends BaseScraper {
  readonly sourceName = 'tx_card_shows';

  /**
   * Parses date strings and ranges commonly found on event websites.
   */
  private parseDateRange(text: string): { startDate: string; endDate?: string } | null {
    // Same-month range: "March 21-22, 2026"
    const sameMonthRange = text.match(
      /([A-Za-z]+)\s+(\d{1,2})\s*[-–]\s*(\d{1,2}),?\s*(\d{4})/
    );
    if (sameMonthRange) {
      const [, month, startDay, endDay, year] = sameMonthRange;
      try {
        const start = parse(`${month} ${startDay}, ${year}`, 'MMMM d, yyyy', new Date());
        const end = parse(`${month} ${endDay}, ${year}`, 'MMMM d, yyyy', new Date());
        return {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
        };
      } catch {
        // Fall through
      }
    }

    // Cross-month range: "March 30 - April 1, 2026"
    const crossMonthRange = text.match(
      /([A-Za-z]+)\s+(\d{1,2})\s*[-–]\s*([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/
    );
    if (crossMonthRange) {
      const [, startMonth, startDay, endMonth, endDay, year] = crossMonthRange;
      try {
        const start = parse(`${startMonth} ${startDay}, ${year}`, 'MMMM d, yyyy', new Date());
        const end = parse(`${endMonth} ${endDay}, ${year}`, 'MMMM d, yyyy', new Date());
        return {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
        };
      } catch {
        // Fall through
      }
    }

    // Single date: "March 21, 2026"
    const singleDate = text.match(/([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/);
    if (singleDate) {
      const [, month, day, year] = singleDate;
      try {
        const date = parse(`${month} ${day}, ${year}`, 'MMMM d, yyyy', new Date());
        return { startDate: format(date, 'yyyy-MM-dd') };
      } catch {
        // Fall through
      }
    }

    return null;
  }

  /**
   * Extracts a city name from text. Since all events are in Texas,
   * we look for known Texas cities or a "City, TX" pattern.
   */
  private extractCity(text: string): string | null {
    // Try "City, TX" pattern
    const cityStateMatch = text.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*TX\b/);
    if (cityStateMatch) {
      return cityStateMatch[1].trim();
    }

    // Known major Texas cities
    const txCities = [
      'Houston', 'Dallas', 'San Antonio', 'Austin', 'Fort Worth',
      'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock',
      'Irving', 'Laredo', 'Garland', 'Frisco', 'McKinney',
      'Amarillo', 'Grand Prairie', 'Brownsville', 'Pasadena',
      'Mesquite', 'Killeen', 'McAllen', 'Midland', 'Beaumont',
      'Round Rock', 'Odessa', 'Waco', 'Tyler', 'College Station',
    ];

    for (const city of txCities) {
      if (text.includes(city)) {
        return city;
      }
    }

    return null;
  }

  /**
   * Attempts to scrape live data from the TX Card Shows website.
   */
  private async scrapeLive(): Promise<ScrapedShow[]> {
    const html = await this.fetchPage(TX_CARD_SHOWS_URL);
    const $ = cheerio.load(html);
    const shows: ScrapedShow[] = [];
    const processedIds = new Set<string>();

    // Try various selectors for event content
    const selectors = [
      '.event-card',
      '.event-item',
      '[class*="event"]',
      'article',
      '.post',
      '.entry',
      '.card',
      '.wp-block-group',
      'section',
    ];

    for (const selector of selectors) {
      $(selector).each((_index, element) => {
        try {
          const $el = $(element);
          const text = $el.text();

          if (text.length < 15) return;

          let name = '';
          const heading = $el.find('h1, h2, h3, h4, h5').first();
          if (heading.length) {
            name = heading.text().trim();
          }

          if (!name || name.length < 3) return;

          // Must look like a card show
          const isRelevant =
            /card\s*show|trading\s*card|collector|sport.*card/i.test(text);
          if (!isRelevant) return;

          // Parse dates
          const dateMatch = text.match(
            /(?:[A-Za-z]+\s+\d{1,2}\s*[-–]\s*(?:[A-Za-z]+\s+)?\d{1,2},?\s*\d{4})|(?:[A-Za-z]+\s+\d{1,2},?\s*\d{4})/
          );
          if (!dateMatch) return;

          const parsedDates = this.parseDateRange(dateMatch[0]);
          if (!parsedDates) return;

          // Extract city (all TX shows)
          const city = this.extractCity(text);
          if (!city) return;

          const sourceId = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

          if (processedIds.has(sourceId)) return;
          processedIds.add(sourceId);

          const link = $el.find('a').first();
          const href = link.attr('href') || '';

          const raw: ScrapedShow = {
            name,
            city,
            state: 'TX',
            startDate: parsedDates.startDate,
            endDate: parsedDates.endDate,
            eventType: 'card_show',
            isPokemonSpecific: false,
            sourceId,
            sourceName: this.sourceName,
            sourceUrl: href
              ? (href.startsWith('http') ? href : new URL(href, TX_CARD_SHOWS_URL).toString())
              : TX_CARD_SHOWS_URL,
            websiteUrl: TX_CARD_SHOWS_URL,
          };

          const result = scrapedShowSchema.safeParse(raw);
          if (result.success) {
            shows.push(result.data);
          }
        } catch (error) {
          console.warn('[tx_card_shows] Error parsing element:', error);
        }
      });

      if (shows.length > 0) break;
    }

    return shows;
  }

  async scrape(): Promise<ScrapedShow[]> {
    console.log('[tx_card_shows] Starting TX Card Shows scraper...');

    try {
      const liveShows = await this.scrapeLive();
      if (liveShows.length > 0) {
        console.log(`[tx_card_shows] Scraped ${liveShows.length} live events`);
        return liveShows;
      }
    } catch (error) {
      console.warn('[tx_card_shows] Live scraping failed, using seed data:', error);
    }

    // Fallback to seed data
    console.log('[tx_card_shows] Using seed data for known TX card shows');
    const validated: ScrapedShow[] = [];
    for (const event of SEED_EVENTS) {
      const result = scrapedShowSchema.safeParse(event);
      if (result.success) {
        validated.push(result.data);
      } else {
        console.warn('[tx_card_shows] Seed validation failed:', result.error.format());
      }
    }

    console.log(`[tx_card_shows] Returning ${validated.length} seed events`);
    return validated;
  }
}
