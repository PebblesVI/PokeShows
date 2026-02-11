import * as cheerio from 'cheerio';
import { parse, format } from 'date-fns';
import { BaseScraper, scrapedShowSchema, type ScrapedShow } from './base-scraper';

const CARD_PARTY_URL = 'https://www.card.party/event-list';

/**
 * Seed data for known Card Party events, used as a fallback when scraping fails.
 * Card Party events are Pokemon-specific conventions.
 */
const SEED_EVENTS: ScrapedShow[] = [
  {
    name: 'Card Party Chicago 2026',
    description: 'The ultimate Pokemon card trading and collecting convention in the Midwest. Features vendors, tournaments, grading services, and special guests.',
    venueName: 'Donald E. Stephens Convention Center',
    address: '5555 N River Rd',
    city: 'Rosemont',
    state: 'IL',
    zipCode: '60018',
    startDate: '2026-04-18',
    endDate: '2026-04-19',
    startTime: '10:00',
    endTime: '17:00',
    admissionPrice: '$30',
    eventType: 'convention',
    isPokemonSpecific: true,
    sourceId: 'card-party-chicago-2026',
    sourceName: 'card_party',
    sourceUrl: 'https://www.card.party/event-list',
    websiteUrl: 'https://www.card.party/',
  },
  {
    name: 'Card Party Houston 2026',
    description: 'Pokemon card convention featuring vendors, live breaks, tournaments, and meet-and-greets with top Pokemon content creators.',
    venueName: 'George R. Brown Convention Center',
    address: '1001 Avenida De Las Americas',
    city: 'Houston',
    state: 'TX',
    zipCode: '77010',
    startDate: '2026-06-13',
    endDate: '2026-06-14',
    startTime: '10:00',
    endTime: '17:00',
    admissionPrice: '$35',
    eventType: 'convention',
    isPokemonSpecific: true,
    sourceId: 'card-party-houston-2026',
    sourceName: 'card_party',
    sourceUrl: 'https://www.card.party/event-list',
    websiteUrl: 'https://www.card.party/',
  },
  {
    name: 'Card Party Los Angeles 2026',
    description: 'West Coast Pokemon card convention with exclusive merchandise, grading submissions, vendor hall, and competitive play area.',
    venueName: 'Los Angeles Convention Center',
    address: '1201 S Figueroa St',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90015',
    startDate: '2026-09-19',
    endDate: '2026-09-20',
    startTime: '10:00',
    endTime: '17:00',
    admissionPrice: '$35',
    eventType: 'convention',
    isPokemonSpecific: true,
    sourceId: 'card-party-los-angeles-2026',
    sourceName: 'card_party',
    sourceUrl: 'https://www.card.party/event-list',
    websiteUrl: 'https://www.card.party/',
  },
];

export class CardPartyScraper extends BaseScraper {
  readonly sourceName = 'card_party';

  /**
   * Parses date ranges like "April 18-19, 2026" or "April 18, 2026".
   */
  private parseDateRange(text: string): { startDate: string; endDate?: string } | null {
    // Same-month range: "April 18-19, 2026"
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

    // Single date: "April 18, 2026"
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
   * Attempts to scrape live event data from the Card Party website.
   */
  private async scrapeLive(): Promise<ScrapedShow[]> {
    const html = await this.fetchPage(CARD_PARTY_URL);
    const $ = cheerio.load(html);
    const shows: ScrapedShow[] = [];
    const processedIds = new Set<string>();

    // Look for event listings - Card Party sites often use Wix or Squarespace
    const selectors = [
      '.event-card',
      '.event-item',
      '[class*="event"]',
      '.eventlist-event',
      'article',
      '.grid-item',
      '.collection-item',
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
          if (!/card\s*party|pokemon|pok[eé]mon/i.test(text)) return;

          // Parse dates
          const dateMatch = text.match(
            /(?:[A-Za-z]+\s+\d{1,2}\s*[-–]\s*(?:[A-Za-z]+\s+)?\d{1,2},?\s*\d{4})|(?:[A-Za-z]+\s+\d{1,2},?\s*\d{4})/
          );
          if (!dateMatch) return;

          const parsedDates = this.parseDateRange(dateMatch[0]);
          if (!parsedDates) return;

          // Parse location
          const locationMatch = text.match(
            /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b/
          );
          if (!locationMatch) return;

          const city = locationMatch[1].trim();
          const state = locationMatch[2];

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
            state,
            startDate: parsedDates.startDate,
            endDate: parsedDates.endDate,
            eventType: 'convention',
            isPokemonSpecific: true,
            sourceId,
            sourceName: this.sourceName,
            sourceUrl: href
              ? (href.startsWith('http') ? href : new URL(href, CARD_PARTY_URL).toString())
              : CARD_PARTY_URL,
            websiteUrl: 'https://www.card.party/',
          };

          const result = scrapedShowSchema.safeParse(raw);
          if (result.success) {
            shows.push(result.data);
          }
        } catch (error) {
          console.warn('[card_party] Error parsing element:', error);
        }
      });

      if (shows.length > 0) break;
    }

    return shows;
  }

  async scrape(): Promise<ScrapedShow[]> {
    console.log('[card_party] Starting Card Party scraper...');

    try {
      const liveShows = await this.scrapeLive();
      if (liveShows.length > 0) {
        console.log(`[card_party] Scraped ${liveShows.length} live events`);
        return liveShows;
      }
    } catch (error) {
      console.warn('[card_party] Live scraping failed, using seed data:', error);
    }

    // Fallback to seed data
    console.log('[card_party] Using seed data for known Card Party events');
    const validated: ScrapedShow[] = [];
    for (const event of SEED_EVENTS) {
      const result = scrapedShowSchema.safeParse(event);
      if (result.success) {
        validated.push(result.data);
      } else {
        console.warn('[card_party] Seed validation failed:', result.error.format());
      }
    }

    console.log(`[card_party] Returning ${validated.length} seed events`);
    return validated;
  }
}
