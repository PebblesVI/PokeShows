import { z } from 'zod';

const US_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
] as const;

export const scrapedShowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be a 2-letter code').refine(
    (val) => US_STATE_CODES.includes(val.toUpperCase() as typeof US_STATE_CODES[number]),
    { message: 'Invalid US state code' },
  ),
  zipCode: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD').optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  admissionPrice: z.string().optional(),
  organizerName: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  eventType: z.enum(['card_show', 'convention', 'tournament', 'meetup']).default('card_show'),
  isPokemonSpecific: z.boolean().default(false),
  sourceId: z.string().min(1, 'sourceId is required'),
  sourceName: z.string().min(1, 'sourceName is required'),
  sourceUrl: z.string().url().optional(),
});

export type ScrapedShow = z.infer<typeof scrapedShowSchema>;

export abstract class BaseScraper {
  abstract readonly sourceName: string;

  protected readonly headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  };

  protected async fetchPage(url: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(url, {
        headers: this.headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${url}`);
      }

      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  abstract scrape(): Promise<ScrapedShow[]>;
}
