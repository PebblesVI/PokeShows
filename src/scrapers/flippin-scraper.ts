import * as cheerio from 'cheerio';
import { parse, format } from 'date-fns';
import { BaseScraper, scrapedShowSchema, type ScrapedShow } from './base-scraper';

const FLIPPIN_URL = 'https://flippincardshow.com/';

/**
 * Known show pages on flippincardshow.com.
 * Discovered from the site navigation under "Special Shows".
 * Updated when new shows are announced.
 */
const KNOWN_SHOW_PAGES = [
  '/special-shows/bestflippincentralmass/',
  '/special-shows/balt-tcg-april-2026/',
  '/special-shows/tcg-boston-may-2026/',
  '/special-shows/vineland-tcg-june2026/',
  '/special-shows/bestflippinpolarpark/',
  '/special-shows/tcgphilly/',
  '/attendees/',
];

/**
 * State abbreviation lookup from full names commonly used on the site.
 */
const STATE_MAP: Record<string, string> = {
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

const US_STATE_CODES = new Set(Object.values(STATE_MAP));

export class FlippinScraper extends BaseScraper {
  readonly sourceName = 'flippin';

  /**
   * Parses date strings in various formats.
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
    // "April 11-12, 2026" or "April 11 - 12, 2026"
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

  /**
   * Extracts state code from text containing city, state references.
   * Handles both abbreviations ("Baltimore, MD") and full names ("Boston, Massachusetts").
   */
  private extractState(text: string): string | null {
    // Try "City, ST" pattern
    const abbrMatch = text.match(/,\s*([A-Z]{2})\b/);
    if (abbrMatch && US_STATE_CODES.has(abbrMatch[1])) {
      return abbrMatch[1];
    }

    // Try full state names
    const lowerText = text.toLowerCase();
    for (const [fullName, code] of Object.entries(STATE_MAP)) {
      if (lowerText.includes(fullName)) {
        return code;
      }
    }

    return null;
  }

  /**
   * Extracts city from text based on common patterns.
   */
  private extractCity(text: string): string | null {
    // "Downtown Baltimore" -> "Baltimore"
    const downtownMatch = text.match(/[Dd]owntown\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    if (downtownMatch) return downtownMatch[1];

    // "City, ST" or "City, State"
    const cityStateMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*(?:[A-Z]{2}|[A-Z][a-z]+)/);
    if (cityStateMatch) return cityStateMatch[1];

    return null;
  }

  /**
   * Discovers show page URLs from the navigation menu on the main site.
   */
  private async discoverShowPages(): Promise<string[]> {
    const pages = new Set<string>(KNOWN_SHOW_PAGES);

    try {
      const html = await this.fetchPage(FLIPPIN_URL);
      const $ = cheerio.load(html);

      // Look for links to /special-shows/ paths in navigation
      $('a[href*="/special-shows/"]').each((_i, el) => {
        const href = $(el).attr('href');
        if (href) {
          try {
            const url = new URL(href, FLIPPIN_URL);
            pages.add(url.pathname);
          } catch {
            // ignore invalid URLs
          }
        }
      });

      // Also look for any navigation links containing show-related keywords
      $('a').each((_i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().toLowerCase();
        if (
          (text.includes('show') || text.includes('event') || text.includes('tcg')) &&
          href.includes('flippincardshow.com')
        ) {
          try {
            const url = new URL(href);
            if (url.pathname !== '/' && !pages.has(url.pathname)) {
              pages.add(url.pathname);
            }
          } catch {
            // ignore
          }
        }
      });
    } catch (error) {
      console.warn('[flippin] Failed to discover show pages:', error);
    }

    return Array.from(pages);
  }

  /**
   * Parses event details from an individual show page.
   * These pages are HTML content that typically includes the event name,
   * dates, venue, location, and pricing in visible text.
   */
  private parseShowPage(html: string, pageUrl: string): ScrapedShow | null {
    const $ = cheerio.load(html);
    const bodyText = $('body').text();
    const title = $('title').text() || '';

    // Combine all text sources
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDesc = $('meta[property="og:description"]').attr('content') || '';
    const allText = `${title} ${ogTitle} ${ogDesc} ${bodyText}`;

    // Must look like a card show page
    if (!/card\s*show|flippin|tcg|trading\s*card|pokemon|pokémon/i.test(allText)) {
      return null;
    }

    // Extract dates
    let parsedDates: { startDate: string; endDate?: string } | null = null;

    // Try date range patterns first
    const dateRangePatterns = [
      /([A-Za-z]+)\s+(\d{1,2})\s*[-–]\s*(\d{1,2}),?\s*(\d{4})/,
      /([A-Za-z]+)\s+(\d{1,2})\s*[-–]\s*([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/,
    ];

    for (const pattern of dateRangePatterns) {
      const match = allText.match(pattern);
      if (match) {
        parsedDates = this.parseDateRange(match[0]);
        if (parsedDates) break;
      }
    }

    // Fall back to single date
    if (!parsedDates) {
      const singleMatch = allText.match(/([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/);
      if (singleMatch) {
        parsedDates = this.parseDateRange(singleMatch[0]);
      }
    }

    // Also try navigation-style dates like "03-07-26"
    if (!parsedDates) {
      const navDate = pageUrl.match(/(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
      if (navDate) {
        const year = navDate[3].length === 2 ? `20${navDate[3]}` : navDate[3];
        const dateStr = `${year}-${navDate[1].padStart(2, '0')}-${navDate[2].padStart(2, '0')}`;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          parsedDates = { startDate: dateStr };
        }
      }
    }

    if (!parsedDates) return null;

    // Skip past events
    const startDate = new Date(parsedDates.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) return null;

    // Extract location
    const state = this.extractState(allText);
    if (!state) return null;

    let city = this.extractCity(allText);

    // Known city mappings from page URLs
    if (!city) {
      const slugCityMap: Record<string, string> = {
        'balt': 'Baltimore',
        'baltimore': 'Baltimore',
        'boston': 'Boston',
        'vineland': 'Vineland',
        'philly': 'Philadelphia',
        'philadelphia': 'Philadelphia',
        'polar': 'Worcester',
        'polarpark': 'Worcester',
        'centralmass': 'Worcester',
        'holycross': 'Worcester',
        'woburn': 'Woburn',
      };

      const lowerUrl = pageUrl.toLowerCase();
      for (const [key, value] of Object.entries(slugCityMap)) {
        if (lowerUrl.includes(key)) {
          city = value;
          break;
        }
      }
    }

    if (!city) return null;

    // Extract event name
    let name = ogTitle || title;
    // Clean up the title
    name = name.replace(/\s*[-|]\s*The Best Flippin.*$/i, '').trim();
    if (!name || name.length < 5) {
      name = `Best Flippin' Card Show ${city}`;
    }

    // Extract venue name
    let venueName: string | undefined;
    const venuePatterns = [
      /(?:at|venue)[:\s]+(?:the\s+)?([A-Z][A-Za-z\s&']+(?:Center|Arena|Hall|Hotel|Resort|Convention|Stadium|Park|Plaza|Church|Campus))/i,
      /((?:Convention|Expo|Event|Hynes|Campus)\s+(?:Center|Hall|Building))/i,
      /(Polar Park)/i,
      /(Crowne Plaza[A-Za-z\s]*)/i,
      /(College of[A-Za-z\s]+)/i,
    ];
    for (const pattern of venuePatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        venueName = match[1].trim();
        break;
      }
    }

    // Extract admission price
    let admissionPrice: string | undefined;
    const pricePatterns = [
      /(?:general\s*admission|GA)[:\s]*\$(\d+)/i,
      /(?:admission|entry|ticket)[:\s]*\$(\d+)/i,
      /\$(\d+)\s*(?:for\s*)?(?:general|admission|GA|entry)/i,
    ];
    for (const pattern of pricePatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        admissionPrice = `$${match[1]}`;
        break;
      }
    }
    if (!admissionPrice && /free\s*(?:admission|entry|event)/i.test(bodyText)) {
      admissionPrice = 'Free';
    }

    // Extract hours
    let startTime: string | undefined;
    let endTime: string | undefined;
    const hoursMatch = bodyText.match(/(\d{1,2})\s*(?::00)?\s*([AP]M)\s*[-–]\s*(\d{1,2})\s*(?::00)?\s*([AP]M)/i);
    if (hoursMatch) {
      startTime = `${hoursMatch[1]}:00 ${hoursMatch[2].toUpperCase()}`;
      endTime = `${hoursMatch[3]}:00 ${hoursMatch[4].toUpperCase()}`;
    }

    // Image
    let imageUrl: string | undefined;
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && ogImage.startsWith('http')) {
      imageUrl = ogImage;
    }

    // Generate source ID from URL path
    const slug = pageUrl.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'flippin-main';
    const year = parsedDates.startDate.split('-')[0];
    const sourceId = `flippin-${slug}-${year}`;

    const fullUrl = new URL(pageUrl, FLIPPIN_URL).toString();

    const raw: ScrapedShow = {
      name,
      city,
      state,
      startDate: parsedDates.startDate,
      endDate: parsedDates.endDate,
      venueName,
      address: undefined,
      admissionPrice,
      startTime,
      endTime,
      eventType: 'card_show',
      isPokemonSpecific: false,
      sourceId,
      sourceName: this.sourceName,
      sourceUrl: fullUrl,
      websiteUrl: FLIPPIN_URL,
      imageUrl,
    };

    const result = scrapedShowSchema.safeParse(raw);
    if (result.success) {
      return result.data;
    }
    console.warn(`[flippin] Validation failed for "${name}":`, result.error.format());
    return null;
  }

  /**
   * Parses the /attendees/ page which lists the regular monthly shows
   * at the Woburn venue along with a schedule of upcoming dates.
   */
  private parseAttendeesPage(html: string): ScrapedShow[] {
    const shows: ScrapedShow[] = [];
    const $ = cheerio.load(html);
    const bodyText = $('body').text();

    // The attendees page mentions monthly shows at the Woburn venue.
    // Look for "Monthly Mixer" style dates
    const dateRegex = /(?:Saturday|Sunday),?\s*([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/gi;
    const monthlyDates = Array.from(bodyText.matchAll(dateRegex));

    const seenDates = new Set<string>();

    for (const match of monthlyDates) {
      const dateStr = `${match[1]} ${match[2]}, ${match[3]}`;
      try {
        const parsed = parse(dateStr, 'MMMM d, yyyy', new Date());
        const formatted = format(parsed, 'yyyy-MM-dd');

        // Skip past dates
        const startDate = new Date(formatted);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) continue;

        if (seenDates.has(formatted)) continue;
        seenDates.add(formatted);

        const raw: ScrapedShow = {
          name: `Best Flippin' Monthly Mixer - ${match[1]} ${match[3]}`,
          city: 'Woburn',
          state: 'MA',
          venueName: 'Crowne Plaza Hotel Woburn',
          startDate: formatted,
          startTime: '10:00 AM',
          endTime: '3:00 PM',
          eventType: 'card_show',
          isPokemonSpecific: false,
          sourceId: `flippin-monthly-${formatted}`,
          sourceName: this.sourceName,
          sourceUrl: `${FLIPPIN_URL}attendees/`,
          websiteUrl: FLIPPIN_URL,
        };

        const result = scrapedShowSchema.safeParse(raw);
        if (result.success) {
          shows.push(result.data);
        }
      } catch {
        // Skip invalid dates
      }
    }

    return shows;
  }

  async scrape(): Promise<ScrapedShow[]> {
    console.log('[flippin] Starting Flippin Card Show scraper...');
    const shows: ScrapedShow[] = [];
    const seenIds = new Set<string>();

    // Discover all show pages from navigation
    const showPages = await this.discoverShowPages();
    console.log(`[flippin] Found ${showPages.length} potential show pages`);

    // Fetch and parse each show page
    for (const pagePath of showPages) {
      try {
        const url = new URL(pagePath, FLIPPIN_URL).toString();
        const html = await this.fetchPage(url);

        // Special handling for the attendees page which lists monthly shows
        if (pagePath.includes('attendees')) {
          const monthlyShows = this.parseAttendeesPage(html);
          for (const show of monthlyShows) {
            if (!seenIds.has(show.sourceId)) {
              seenIds.add(show.sourceId);
              shows.push(show);
            }
          }
          continue;
        }

        // Parse individual show page
        const show = this.parseShowPage(html, pagePath);
        if (show && !seenIds.has(show.sourceId)) {
          seenIds.add(show.sourceId);
          shows.push(show);
          console.log(`[flippin] Found: ${show.name} on ${show.startDate} in ${show.city}, ${show.state}`);
        }

        // Rate limit
        await this.delay(500);
      } catch (error) {
        console.warn(`[flippin] Failed to fetch ${pagePath}:`, error);
      }
    }

    console.log(`[flippin] Total shows scraped: ${shows.length}`);
    return shows;
  }
}
