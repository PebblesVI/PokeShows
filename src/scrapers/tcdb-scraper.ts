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

  async scrape(): Promise<ScrapedShow[]> {
    console.log('[tcdb] Starting TCDB card shows scraper...');

    let puppeteerExtra;
    let StealthPlugin;
    try {
      puppeteerExtra = (await import('puppeteer-extra')).default;
      StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
    } catch {
      console.warn('[tcdb] puppeteer-extra not available — skipping TCDB scraper');
      return [];
    }

    puppeteerExtra.use(StealthPlugin());

    let browser;
    try {
      console.log('[tcdb] Launching stealth browser...');
      browser = await puppeteerExtra.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      console.log('[tcdb] Navigating to TCDB card shows...');
      await page.goto('https://www.tcdb.com/CardShows.cfm', {
        waitUntil: 'networkidle2',
        timeout: 60_000,
      });

      // Handle Cloudflare challenge
      const title = await page.title();
      if (title.includes('Just a moment')) {
        console.log('[tcdb] Cloudflare challenge detected, waiting...');
        try {
          await page.waitForFunction(
            'document.title.indexOf("Just a moment") === -1',
            { timeout: 30_000 },
          );
          await this.delay(2000);
          console.log('[tcdb] Cloudflare challenge passed!');
        } catch {
          console.warn('[tcdb] Cloudflare challenge timed out');
          return [];
        }
      }

      const html = await page.content();
      const pageTitle = await page.title();

      if (pageTitle.includes('Just a moment')) {
        console.warn('[tcdb] Still blocked by Cloudflare');
        return [];
      }

      const shows = this.parseCarouselShows(html);
      console.log(`[tcdb] Found ${shows.length} US shows`);
      return shows;
    } catch (error) {
      console.error('[tcdb] Scraper failed:', error);
      return [];
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
