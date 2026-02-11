import * as cheerio from 'cheerio';
import { parse, format } from 'date-fns';
import { BaseScraper, scrapedShowSchema, type ScrapedShow } from './base-scraper';

const FLIPPIN_URL = 'https://flippincardshow.com/';

export class FlippinScraper extends BaseScraper {
  readonly sourceName = 'flippin';

  /**
   * Parses date strings in various formats.
   * Handles: "March 14, 2026", "03/14/2026", "2026-03-14"
   */
  private parseDate(dateStr: string): string | null {
    const cleaned = dateStr.trim();

    // "March 14, 2026"
    const longFormat = cleaned.match(/([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/);
    if (longFormat) {
      try {
        const parsed = parse(`${longFormat[1]} ${longFormat[2]}, ${longFormat[3]}`, 'MMMM d, yyyy', new Date());
        return format(parsed, 'yyyy-MM-dd');
      } catch {
        // Fall through
      }
    }

    // "03/14/2026"
    const slashFormat = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashFormat) {
      try {
        const parsed = parse(cleaned, 'MM/dd/yyyy', new Date());
        return format(parsed, 'yyyy-MM-dd');
      } catch {
        // Fall through
      }
    }

    // Already ISO format
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      return cleaned;
    }

    return null;
  }

  /**
   * Parses a date range string and returns start and end dates.
   */
  private parseDateRange(text: string): { startDate: string; endDate?: string } | null {
    // "March 14-15, 2026"
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

    // "March 30 - April 1, 2026"
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

    // Single date
    const singleDate = this.parseDate(text);
    if (singleDate) {
      return { startDate: singleDate };
    }

    return null;
  }

  async scrape(): Promise<ScrapedShow[]> {
    console.log('[flippin] Starting Flippin Card Show scraper...');
    const shows: ScrapedShow[] = [];

    let html: string;
    try {
      html = await this.fetchPage(FLIPPIN_URL);
    } catch (error) {
      console.error('[flippin] Failed to fetch page:', error);
      return [];
    }

    const $ = cheerio.load(html);

    // Squarespace sites typically use structured blocks for events.
    // Common patterns: .sqs-block, .summary-item, .eventlist-event,
    // or JSON-LD structured data.
    const processedIds = new Set<string>();

    // Strategy 1: Look for JSON-LD structured data (common in Squarespace)
    $('script[type="application/ld+json"]').each((_index, script) => {
      try {
        const jsonText = $(script).html();
        if (!jsonText) return;

        const data = JSON.parse(jsonText);
        const events = Array.isArray(data) ? data : data['@type'] === 'Event' ? [data] : [];

        for (const event of events) {
          if (event['@type'] !== 'Event') continue;

          const name = event.name?.trim();
          if (!name) continue;

          const startDate = event.startDate
            ? format(new Date(event.startDate), 'yyyy-MM-dd')
            : null;
          if (!startDate) continue;

          const endDate = event.endDate
            ? format(new Date(event.endDate), 'yyyy-MM-dd')
            : undefined;

          const location = event.location;
          let city = '';
          let state = '';
          let venueName: string | undefined;
          let address: string | undefined;

          if (location) {
            venueName = location.name;
            if (location.address) {
              city = location.address.addressLocality || '';
              state = location.address.addressRegion || '';
              address = location.address.streetAddress;
            }
          }

          if (!city || !state) continue;

          const sourceId = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

          if (processedIds.has(sourceId)) continue;
          processedIds.add(sourceId);

          const raw: ScrapedShow = {
            name,
            city,
            state: state.length === 2 ? state.toUpperCase() : state,
            startDate,
            endDate,
            venueName,
            address,
            eventType: 'card_show',
            isPokemonSpecific: false,
            sourceId,
            sourceName: this.sourceName,
            sourceUrl: event.url || FLIPPIN_URL,
            websiteUrl: FLIPPIN_URL,
          };

          const result = scrapedShowSchema.safeParse(raw);
          if (result.success) {
            shows.push(result.data);
          }
        }
      } catch {
        // JSON parse failed, continue to other strategies
      }
    });

    // Strategy 2: Parse Squarespace event list blocks
    if (shows.length === 0) {
      const eventSelectors = [
        '.eventlist-event',
        '.summary-item',
        '.sqs-block-content',
        '[data-block-type]',
        '.index-section',
      ];

      for (const selector of eventSelectors) {
        $(selector).each((_index, element) => {
          try {
            const $el = $(element);
            const text = $el.text();

            if (text.length < 15) return;

            // Find heading for event name
            let name = '';
            const heading = $el.find('h1, h2, h3, h4, .eventlist-title, .summary-title').first();
            if (heading.length) {
              name = heading.text().trim();
            }

            if (!name || name.length < 3) return;

            // Must look like a card show / event
            const isRelevant =
              /card\s*show|flippin|trading\s*card|collector|sport/i.test(text);
            if (!isRelevant) return;

            // Find dates
            const dateText = $el.find('.eventlist-datetag, .summary-metadata-item--date, time').text() || text;
            const dateMatch = dateText.match(
              /(?:[A-Za-z]+\s+\d{1,2}\s*[-–]\s*(?:[A-Za-z]+\s+)?\d{1,2},?\s*\d{4})|(?:[A-Za-z]+\s+\d{1,2},?\s*\d{4})/
            );
            if (!dateMatch) return;

            const parsedDates = this.parseDateRange(dateMatch[0]);
            if (!parsedDates) return;

            // Find location (City, ST pattern)
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
            const sourceUrl = href
              ? (href.startsWith('http') ? href : new URL(href, FLIPPIN_URL).toString())
              : FLIPPIN_URL;

            const raw: ScrapedShow = {
              name,
              city,
              state,
              startDate: parsedDates.startDate,
              endDate: parsedDates.endDate,
              eventType: 'card_show',
              isPokemonSpecific: false,
              sourceId,
              sourceName: this.sourceName,
              sourceUrl,
              websiteUrl: FLIPPIN_URL,
            };

            const result = scrapedShowSchema.safeParse(raw);
            if (result.success) {
              shows.push(result.data);
            }
          } catch (error) {
            console.warn('[flippin] Error parsing element:', error);
          }
        });

        if (shows.length > 0) break;
      }
    }

    console.log(`[flippin] Total shows scraped: ${shows.length}`);
    return shows;
  }
}
