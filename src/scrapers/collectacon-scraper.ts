import * as cheerio from 'cheerio';
import { parse, format } from 'date-fns';
import { BaseScraper, scrapedShowSchema, type ScrapedShow } from './base-scraper';

const COLLECTACON_URL = 'https://collectaconusa.com/';

export class CollectaConScraper extends BaseScraper {
  readonly sourceName = 'collectacon';

  /**
   * Attempts to parse a variety of date formats commonly found on event websites.
   * Examples: "March 14-15, 2026", "March 14, 2026", "03/14/2026"
   */
  private parseDateRange(dateStr: string): { startDate: string; endDate?: string } | null {
    const cleaned = dateStr.trim();

    // Try range: "March 14-15, 2026" or "March 14 - 15, 2026"
    const sameMonthRange = cleaned.match(
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

    // Try cross-month range: "March 30 - April 1, 2026"
    const crossMonthRange = cleaned.match(
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

    // Try single date: "March 14, 2026"
    const singleDate = cleaned.match(/([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/);
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
   * Extracts city and state from a location string like "Houston, TX" or "Orlando, Florida".
   */
  private parseLocation(locationStr: string): { city: string; state: string } | null {
    const stateAbbrMatch = locationStr.match(/([^,]+),\s*([A-Z]{2})\b/);
    if (stateAbbrMatch) {
      return {
        city: stateAbbrMatch[1].trim(),
        state: stateAbbrMatch[2],
      };
    }

    // Try full state name mapping
    const fullStateMatch = locationStr.match(/([^,]+),\s*([A-Za-z\s]+)/);
    if (fullStateMatch) {
      const stateMap: Record<string, string> = {
        'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
        'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
        'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
        'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
        'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
        'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN',
        'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE',
        'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
        'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
        'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR',
        'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
        'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
        'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
        'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
      };

      const stateAbbr = stateMap[fullStateMatch[2].trim().toLowerCase()];
      if (stateAbbr) {
        return {
          city: fullStateMatch[1].trim(),
          state: stateAbbr,
        };
      }
    }

    return null;
  }

  /**
   * Generates a sourceId slug from an event name or URL.
   */
  private generateSourceId(name: string, href?: string): string {
    if (href) {
      // Extract slug from URL path
      try {
        const url = new URL(href, COLLECTACON_URL);
        const slug = url.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-');
        if (slug) return slug;
      } catch {
        // Fall through to name-based slug
      }
    }

    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async scrape(): Promise<ScrapedShow[]> {
    console.log('[collectacon] Starting Collect-A-Con scraper...');
    const shows: ScrapedShow[] = [];

    let html: string;
    try {
      html = await this.fetchPage(COLLECTACON_URL);
    } catch (error) {
      console.error('[collectacon] Failed to fetch page:', error);
      return [];
    }

    const $ = cheerio.load(html);

    // Collect-A-Con typically lists events in card-like sections or divs.
    // We look for common patterns: event cards, sections with dates and locations.
    const selectors = [
      '.event-card',
      '.event-item',
      '.events-list .event',
      '[class*="event"]',
      'article',
      '.wp-block-group',
      'section',
    ];

    const processedNames = new Set<string>();

    for (const selector of selectors) {
      $(selector).each((_index, element) => {
        try {
          const $el = $(element);
          const text = $el.text();

          // Skip if too little content
          if (text.length < 20) return;

          // Try to find event name - look for headings or prominent text
          let name = '';
          const heading = $el.find('h1, h2, h3, h4, h5, h6').first();
          if (heading.length) {
            name = heading.text().trim();
          }

          // Skip non-event sections
          if (!name || name.length < 3 || name.length > 200) return;
          if (processedNames.has(name.toLowerCase())) return;

          // Must contain "collect" or reference an event
          const isRelevant =
            /collect.?a.?con/i.test(name) ||
            /collect.?a.?con/i.test(text) ||
            /convention|expo|show/i.test(name);
          if (!isRelevant) return;

          // Find date information
          const dateMatch = text.match(
            /(?:[A-Za-z]+\s+\d{1,2}\s*[-–]\s*(?:[A-Za-z]+\s+)?\d{1,2},?\s*\d{4})|(?:[A-Za-z]+\s+\d{1,2},?\s*\d{4})/
          );
          if (!dateMatch) return;

          const parsedDates = this.parseDateRange(dateMatch[0]);
          if (!parsedDates) return;

          // Find location
          const locationMatch = text.match(
            /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b/
          );
          if (!locationMatch) return;

          const location = this.parseLocation(locationMatch[0]);
          if (!location) return;

          // Find link
          const link = $el.find('a').first();
          const href = link.attr('href') || '';

          const sourceId = this.generateSourceId(name, href);
          const sourceUrl = href
            ? (href.startsWith('http') ? href : new URL(href, COLLECTACON_URL).toString())
            : COLLECTACON_URL;

          // Find image
          const img = $el.find('img').first();
          const imageUrl = img.attr('src') || undefined;

          processedNames.add(name.toLowerCase());

          const raw: ScrapedShow = {
            name,
            city: location.city,
            state: location.state,
            startDate: parsedDates.startDate,
            endDate: parsedDates.endDate,
            eventType: 'convention',
            isPokemonSpecific: false,
            sourceId,
            sourceName: this.sourceName,
            sourceUrl,
            websiteUrl: COLLECTACON_URL,
            imageUrl: imageUrl?.startsWith('http') ? imageUrl : undefined,
          };

          const result = scrapedShowSchema.safeParse(raw);
          if (result.success) {
            shows.push(result.data);
          } else {
            console.warn(
              `[collectacon] Validation failed for "${name}":`,
              result.error.format(),
            );
          }
        } catch (error) {
          console.warn('[collectacon] Error parsing element:', error);
        }
      });

      // If we found shows with this selector, no need to try others
      if (shows.length > 0) break;
    }

    console.log(`[collectacon] Total shows scraped: ${shows.length}`);
    return shows;
  }
}
