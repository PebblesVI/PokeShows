import * as cheerio from 'cheerio';
import { parse, format } from 'date-fns';
import { BaseScraper, scrapedShowSchema, type ScrapedShow } from './base-scraper';

const COLLECTACON_URL = 'https://collectaconusa.com/';

/**
 * Known Collect-A-Con city pages with their state codes.
 * These are discovered from the sitemap and search results.
 * The scraper visits each city page to extract event details.
 */
const CITY_PAGES: Array<{ slug: string; city: string; state: string }> = [
  { slug: 'atlanta', city: 'Atlanta', state: 'GA' },
  { slug: 'orlando', city: 'Orlando', state: 'FL' },
  { slug: 'losangeles', city: 'Los Angeles', state: 'CA' },
  { slug: 'richmond', city: 'Richmond', state: 'VA' },
  { slug: 'kansas-city', city: 'Kansas City', state: 'MO' },
  { slug: 'miami', city: 'Fort Lauderdale', state: 'FL' },
  { slug: 'chicago', city: 'Chicago', state: 'IL' },
  { slug: 'houston', city: 'Houston', state: 'TX' },
  { slug: 'houston2', city: 'Houston', state: 'TX' },
  { slug: 'dallas', city: 'Dallas', state: 'TX' },
  { slug: 'san-antonio', city: 'San Antonio', state: 'TX' },
  { slug: 'edison', city: 'Edison', state: 'NJ' },
  { slug: 'cleveland', city: 'Cleveland', state: 'OH' },
  { slug: 'fort-worth', city: 'Fort Worth', state: 'TX' },
  { slug: 'losangeles2', city: 'Los Angeles', state: 'CA' },
];

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
   * Parse event details from a rendered city page's text content.
   * Collect-A-Con city pages typically contain the date, venue, and location
   * in the rendered DOM even though they're loaded via JS.
   */
  private parseRenderedPage(
    html: string,
    cityInfo: { slug: string; city: string; state: string },
  ): ScrapedShow | null {
    const $ = cheerio.load(html);
    const bodyText = $('body').text();

    // Look for dates anywhere in the page
    const datePatterns = [
      // "February 7-8, 2026" or "February 7 - 8, 2026"
      /([A-Za-z]+)\s+(\d{1,2})\s*[-–]\s*(\d{1,2}),?\s*(\d{4})/,
      // "February 7, 2026"
      /([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/,
    ];

    let parsedDates: { startDate: string; endDate?: string } | null = null;

    for (const pattern of datePatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        parsedDates = this.parseDateRange(match[0]);
        if (parsedDates) break;
      }
    }

    if (!parsedDates) {
      // Try to find dates in meta tags
      const ogDescription = $('meta[property="og:description"]').attr('content') || '';
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const metaText = ogDescription + ' ' + metaDescription;

      for (const pattern of datePatterns) {
        const match = metaText.match(pattern);
        if (match) {
          parsedDates = this.parseDateRange(match[0]);
          if (parsedDates) break;
        }
      }
    }

    if (!parsedDates) return null;

    // Skip past events
    const startDate = new Date(parsedDates.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) return null;

    // Try to find venue name
    let venueName: string | undefined;
    const venuePatterns = [
      /(?:venue|location|at the|held at|taking place at)[:\s]*([A-Z][A-Za-z\s&']+(?:Center|Arena|Hall|Hotel|Resort|Convention|Stadium|Expo|Complex|Pavilion|Civic|Building))/i,
      /((?:Convention|Expo|Event)\s+(?:Center|Hall|Building))/i,
    ];
    for (const pattern of venuePatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        venueName = match[1].trim();
        break;
      }
    }

    // Try to find ticket pricing
    let admissionPrice: string | undefined;
    const priceMatch = bodyText.match(/\$(\d+(?:\.\d{2})?)/);
    if (priceMatch) {
      admissionPrice = `$${priceMatch[1]}`;
    }

    // Find image URL
    let imageUrl: string | undefined;
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && ogImage.startsWith('http')) {
      imageUrl = ogImage;
    }

    // Construct event name with year
    const year = parsedDates.startDate.split('-')[0];
    const name = `Collect-A-Con ${cityInfo.city} ${year}`;

    const sourceId = `collectacon-${cityInfo.slug}-${year}`;

    const raw: ScrapedShow = {
      name,
      description: `The Nation's Largest Trading Card & Pop Culture Convention featuring 900+ vendor tables with sports cards, Pokemon, Yu-Gi-Oh!, Magic: The Gathering, Funko POPs, comics, and more.`,
      venueName,
      city: cityInfo.city,
      state: cityInfo.state,
      startDate: parsedDates.startDate,
      endDate: parsedDates.endDate,
      admissionPrice,
      eventType: 'convention',
      isPokemonSpecific: false,
      sourceId,
      sourceName: this.sourceName,
      sourceUrl: `${COLLECTACON_URL}${cityInfo.slug}/`,
      websiteUrl: COLLECTACON_URL,
      imageUrl,
    };

    const result = scrapedShowSchema.safeParse(raw);
    if (result.success) {
      return result.data;
    }
    console.warn(`[collectacon] Validation failed for "${name}":`, result.error.format());
    return null;
  }

  /**
   * Try to fetch a page with puppeteer to render JS content.
   */
  private async fetchRendered(url: string): Promise<string | null> {
    let puppeteer;
    try {
      puppeteer = (await import('puppeteer')).default;
    } catch {
      console.warn('[collectacon] puppeteer not available');
      return null;
    }

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30_000,
      });

      // Wait a bit for dynamic content to render
      await this.delay(2000);

      return await page.content();
    } catch (error) {
      console.warn(`[collectacon] Puppeteer failed for ${url}:`, error);
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async scrape(): Promise<ScrapedShow[]> {
    console.log('[collectacon] Starting Collect-A-Con scraper...');
    const shows: ScrapedShow[] = [];
    const seenIds = new Set<string>();

    // Strategy 1: Try direct fetch of city pages (cheaper, may work partially)
    console.log('[collectacon] Trying direct fetch of city pages...');
    for (const cityInfo of CITY_PAGES) {
      const url = `${COLLECTACON_URL}${cityInfo.slug}/`;
      try {
        const html = await this.fetchPage(url);
        const show = this.parseRenderedPage(html, cityInfo);
        if (show && !seenIds.has(show.sourceId)) {
          seenIds.add(show.sourceId);
          shows.push(show);
        }
        await this.delay(500);
      } catch {
        // Will fall through to puppeteer strategy
      }
    }

    if (shows.length > 0) {
      console.log(`[collectacon] Direct fetch found ${shows.length} shows`);
      return shows;
    }

    // Strategy 2: Use puppeteer to render JS-heavy pages
    console.log('[collectacon] Direct fetch found nothing, trying puppeteer...');

    let puppeteer;
    try {
      puppeteer = (await import('puppeteer')).default;
    } catch {
      console.warn('[collectacon] puppeteer not available — skipping puppeteer strategy');
      return shows;
    }

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      for (const cityInfo of CITY_PAGES) {
        const url = `${COLLECTACON_URL}${cityInfo.slug}/`;
        try {
          const page = await browser.newPage();
          await page.setViewport({ width: 1280, height: 800 });

          await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30_000,
          });

          // Wait for dynamic content
          await this.delay(2000);

          const html = await page.content();
          await page.close();

          const show = this.parseRenderedPage(html, cityInfo);
          if (show && !seenIds.has(show.sourceId)) {
            seenIds.add(show.sourceId);
            shows.push(show);
            console.log(`[collectacon] Found: ${show.name} on ${show.startDate}`);
          }

          // Rate limit
          await this.delay(1000);
        } catch (error) {
          console.warn(`[collectacon] Failed to scrape ${cityInfo.slug}:`, error);
        }
      }
    } catch (error) {
      console.error('[collectacon] Browser launch failed:', error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    console.log(`[collectacon] Total shows scraped: ${shows.length}`);
    return shows;
  }
}
