import * as cheerio from 'cheerio';
import { parse, format } from 'date-fns';
import { BaseScraper, scrapedShowSchema, type ScrapedShow } from './base-scraper';

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

const STATE_CODE_SET = new Set(Object.keys(STATE_NAMES));

// High-traffic states to scrape for maximum coverage
const TARGET_STATES = [
  'CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
  'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI',
  'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'NV',
];

export class TcdbScraper extends BaseScraper {
  readonly sourceName = 'tcdb';

  private parseDate(dateStr: string): string | null {
    try {
      const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '').trim();
      const parsed = parse(cleaned, 'MMMM d, yyyy', new Date());
      return format(parsed, 'yyyy-MM-dd');
    } catch {
      return null;
    }
  }

  /**
   * Parses the main CardShows.cfm page. TCDB lists all upcoming shows in a
   * Bootstrap carousel in the sidebar. Each carousel-item contains:
   *   <br><strong><a href="...MODE=VIEW&ID=XXX">Name</a></strong><br><br>
   *   DayOfWeek, Month Day, Year<br>StartTime - EndTime<br><br>
   *   VenueName<br>
   *   City, ST, Country
   */
  private parseCarouselShows(html: string): ScrapedShow[] {
    const $ = cheerio.load(html);
    const shows: ScrapedShow[] = [];

    $('.carousel-item').each((_i, el) => {
      try {
        const $item = $(el);
        const link = $item.find('a[href*="MODE=VIEW"]').first();
        if (!link.length) return;

        const name = link.text().trim();
        const href = link.attr('href') || '';
        const idMatch = href.match(/ID=(\d+)/i);
        if (!idMatch || !name) return;

        const itemHtml = $item.html() || '';
        const parts = itemHtml
          .split(/<br\s*\/?>/gi)
          .map((s) => s.replace(/<[^>]+>/g, '').trim())
          .filter((s) => s.length > 0);

        let dateStr: string | null = null;
        let startTime: string | undefined;
        let endTime: string | undefined;
        let venueName: string | undefined;
        let city: string | null = null;
        let stateCode: string | null = null;
        let admissionPrice: string | undefined;

        for (const part of parts) {
          if (part === name) continue;

          // Date: "Wednesday, February 11, 2026"
          if (/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),/.test(part)) {
            dateStr = this.parseDate(part);
            continue;
          }

          // Time: "5:00 PM - 9:00 PM"
          const timeMatch = part.match(/^(\d{1,2}:\d{2}\s*[AP]M)\s*[-–]\s*(\d{1,2}:\d{2}\s*[AP]M)$/i);
          if (timeMatch) {
            startTime = timeMatch[1].trim();
            endTime = timeMatch[2].trim();
            continue;
          }

          // US location: "City, ST, United States"
          const usMatch = part.match(/^(.+?),\s*([A-Z]{2}),\s*United States$/);
          if (usMatch && STATE_CODE_SET.has(usMatch[2])) {
            city = usMatch[1].trim();
            stateCode = usMatch[2];
            continue;
          }

          // Non-US locations — skip
          if (/,\s*(Canada|United Kingdom|Australia|Germany|France|Japan|Mexico)/i.test(part)) {
            continue;
          }

          // Try to extract admission/pricing info
          const priceMatch = part.match(/(?:admission|entry|fee|price)[:\s]*\$?(\d+(?:\.\d{2})?)/i)
            || part.match(/free\s*(?:admission|entry)/i);
          if (priceMatch) {
            admissionPrice = priceMatch[0].toLowerCase().includes('free')
              ? 'Free'
              : `$${priceMatch[1]}`;
            continue;
          }

          // Venue name (appears after date/time, before location)
          if (!venueName && dateStr) {
            venueName = part;
          }
        }

        if (!stateCode || !dateStr || !city) return;

        const sourceUrl = `https://www.tcdb.com${href.startsWith('/') ? '' : '/'}${href}`;

        const raw: ScrapedShow = {
          name,
          venueName,
          city,
          state: stateCode,
          startDate: dateStr,
          startTime,
          endTime,
          admissionPrice,
          eventType: 'card_show',
          isPokemonSpecific: /pok[eé]mon/i.test(name),
          sourceId: idMatch[1],
          sourceName: this.sourceName,
          sourceUrl,
        };

        const result = scrapedShowSchema.safeParse(raw);
        if (result.success) {
          shows.push(result.data);
        }
      } catch (error) {
        console.warn('[tcdb] Error parsing carousel item:', error);
      }
    });

    return shows;
  }

  /**
   * Parses the state-specific listing page which shows card shows as table rows
   * or structured list items. These pages use a different layout than the
   * carousel on the main page.
   */
  private parseStateShows(html: string, fallbackState: string): ScrapedShow[] {
    const $ = cheerio.load(html);
    const shows: ScrapedShow[] = [];

    // TCDB state pages list shows with links to MODE=VIEW&ID=xxx
    // Each show entry typically has the show name as an anchor and date/location text nearby
    $('a[href*="MODE=VIEW"]').each((_i, el) => {
      try {
        const $link = $(el);
        const name = $link.text().trim();
        const href = $link.attr('href') || '';
        const idMatch = href.match(/ID=(\d+)/i);
        if (!idMatch || !name || name.length < 3) return;

        // Get the parent row or container
        const $row = $link.closest('tr, div, li, .row, p');
        const rowText = $row.length ? $row.text() : '';

        // Also check the next sibling elements for date/location info
        const $parent = $link.parent();
        const siblingText = $parent.text() + ' ' + ($parent.next().text() || '');
        const combinedText = rowText + ' ' + siblingText;

        // Parse date from nearby text
        let dateStr: string | null = null;
        const dayDateMatch = combinedText.match(
          /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s*([A-Za-z]+\s+\d{1,2},\s*\d{4})/
        );
        if (dayDateMatch) {
          dateStr = this.parseDate(dayDateMatch[0]);
        } else {
          // Try without day name: "February 14, 2026"
          const simpleDateMatch = combinedText.match(/([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/);
          if (simpleDateMatch) {
            try {
              const parsed = parse(
                `${simpleDateMatch[1]} ${simpleDateMatch[2]}, ${simpleDateMatch[3]}`,
                'MMMM d, yyyy',
                new Date(),
              );
              dateStr = format(parsed, 'yyyy-MM-dd');
            } catch { /* ignore */ }
          }
        }

        if (!dateStr) return;

        // Parse time
        let startTime: string | undefined;
        let endTime: string | undefined;
        const timeMatch = combinedText.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*[-–]\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
        if (timeMatch) {
          startTime = timeMatch[1].trim();
          endTime = timeMatch[2].trim();
        }

        // Parse location
        let city: string | null = null;
        let stateCode: string | null = null;
        const usMatch = combinedText.match(/([A-Z][A-Za-z\s]+?),\s*([A-Z]{2})(?:,\s*United States)?/);
        if (usMatch && STATE_CODE_SET.has(usMatch[2])) {
          city = usMatch[1].trim();
          stateCode = usMatch[2];
        }

        // Fallback state from the page URL
        if (!stateCode) {
          stateCode = fallbackState;
        }
        if (!city) return;

        const sourceUrl = `https://www.tcdb.com${href.startsWith('/') ? '' : '/'}${href}`;

        const raw: ScrapedShow = {
          name,
          city,
          state: stateCode,
          startDate: dateStr,
          startTime,
          endTime,
          eventType: 'card_show',
          isPokemonSpecific: /pok[eé]mon/i.test(name),
          sourceId: idMatch[1],
          sourceName: this.sourceName,
          sourceUrl,
        };

        const result = scrapedShowSchema.safeParse(raw);
        if (result.success) {
          shows.push(result.data);
        }
      } catch (error) {
        console.warn('[tcdb] Error parsing state show:', error);
      }
    });

    return shows;
  }

  /**
   * Try to fetch the page with puppeteer (handles Cloudflare JS challenges).
   */
  private async fetchWithPuppeteer(url: string): Promise<string | null> {
    let puppeteerExtra;
    let stealthFn;
    try {
      const peModule = await import('puppeteer-extra');
      puppeteerExtra = peModule.default ?? peModule;
      const stealthModule = await import('puppeteer-extra-plugin-stealth');
      stealthFn = stealthModule.default ?? stealthModule;
    } catch {
      console.warn('[tcdb] puppeteer-extra not available');
      return null;
    }

    puppeteerExtra.use(typeof stealthFn === 'function' ? stealthFn() : stealthFn);

    let browser;
    try {
      browser = await puppeteerExtra.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      // Set extra headers to look more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60_000,
      });

      // Handle Cloudflare challenge with multiple retries
      const title = await page.title();
      if (title.includes('Just a moment') || title.includes('Checking your browser')) {
        console.log('[tcdb] Cloudflare challenge detected, waiting...');
        try {
          await page.waitForFunction(
            '!document.title.includes("Just a moment") && !document.title.includes("Checking")',
            { timeout: 45_000 },
          );
          // Extra delay for page to fully render after challenge
          await this.delay(3000);
          console.log('[tcdb] Cloudflare challenge passed!');
        } catch {
          console.warn('[tcdb] Cloudflare challenge timed out');
          return null;
        }
      }

      const html = await page.content();
      const pageTitle = await page.title();

      if (pageTitle.includes('Just a moment') || pageTitle.includes('Checking')) {
        console.warn('[tcdb] Still blocked by Cloudflare after waiting');
        return null;
      }

      return html;
    } catch (error) {
      console.warn('[tcdb] Puppeteer fetch failed:', error);
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async scrape(): Promise<ScrapedShow[]> {
    console.log('[tcdb] Starting TCDB card shows scraper...');
    const seenIds = new Set<string>();
    const allShows: ScrapedShow[] = [];

    // Strategy 1: Try the main page with puppeteer (carousel view)
    console.log('[tcdb] Trying main page with puppeteer...');
    const mainHtml = await this.fetchWithPuppeteer('https://www.tcdb.com/CardShows.cfm');

    if (mainHtml) {
      const carouselShows = this.parseCarouselShows(mainHtml);
      console.log(`[tcdb] Carousel parsing found ${carouselShows.length} shows`);

      for (const show of carouselShows) {
        if (!seenIds.has(show.sourceId)) {
          seenIds.add(show.sourceId);
          allShows.push(show);
        }
      }

      // Also try table/link parsing on the main page
      const tableShows = this.parseStateShows(mainHtml, '');
      for (const show of tableShows) {
        if (!seenIds.has(show.sourceId)) {
          seenIds.add(show.sourceId);
          allShows.push(show);
        }
      }
    }

    // Strategy 2: Try state-specific pages with direct fetch (may bypass Cloudflare)
    if (allShows.length < 5) {
      console.log('[tcdb] Main page yielded few results, trying state pages...');

      for (const state of TARGET_STATES) {
        const stateUrl = `https://www.tcdb.com/CardShows.cfm?MODE=Location&State=${state}&Country=United+States`;
        try {
          const html = await this.fetchPage(stateUrl);
          const stateShows = this.parseStateShows(html, state);

          for (const show of stateShows) {
            if (!seenIds.has(show.sourceId)) {
              seenIds.add(show.sourceId);
              allShows.push(show);
            }
          }

          // Rate limit between state requests
          await this.delay(1000);
        } catch {
          // If direct fetch fails (403), try puppeteer for first few states
          if (allShows.length === 0 && TARGET_STATES.indexOf(state) < 5) {
            console.log(`[tcdb] Direct fetch failed for ${state}, trying puppeteer...`);
            const html = await this.fetchWithPuppeteer(stateUrl);
            if (html) {
              const stateShows = this.parseStateShows(html, state);
              for (const show of stateShows) {
                if (!seenIds.has(show.sourceId)) {
                  seenIds.add(show.sourceId);
                  allShows.push(show);
                }
              }
            }
          }
          // Otherwise skip silently — we'll get what we can
        }
      }
    }

    console.log(`[tcdb] Total US shows found: ${allShows.length}`);
    return allShows;
  }
}
