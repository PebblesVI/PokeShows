export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  const content = `# PokeShows

> PokeShows is the most comprehensive directory of Pokemon and trading card shows, conventions, and tournaments across the United States.

## What Data Is Available

- **Card Shows**: Upcoming Pokemon and trading card shows across all 50 US states
- **Card of the Day**: A daily featured Pokemon card with pricing info and details
- **Buy Cards**: Browse and buy Pokemon cards from trusted marketplaces

## How to Find Shows

- **By State**: ${siteUrl}/shows/state/{state-code} (e.g., /shows/state/ca for California)
- **By City**: ${siteUrl}/shows/city/{city-state} (e.g., /shows/city/los-angeles-ca)
- **By Date**: Browse shows filtered by upcoming dates
- **Search**: Use the API to search shows by name, city, or venue

## Key URLs

- Homepage: ${siteUrl}
- All Shows: ${siteUrl}/shows
- Shows by State: ${siteUrl}/shows/state/{state-code}
- Shows by City: ${siteUrl}/shows/city/{city-state}
- Card of the Day: ${siteUrl}/card-of-the-day
- Buy Cards: ${siteUrl}/buy
- Blog: ${siteUrl}/blog
- About: ${siteUrl}/about
- Submit a Show: ${siteUrl}/submit

## Structured Data

- **JSON-LD**: Every show page includes Event schema markup. State listing pages include ItemList schema. FAQ schema is available on state pages.
- **RSS Feed**: ${siteUrl}/feed.xml — Latest shows in RSS 2.0 format
- **Sitemap**: ${siteUrl}/sitemap.xml — Full site sitemap for crawling

## API Endpoints

- **Search Shows**: GET ${siteUrl}/api/shows/search
  - Query parameters: state, city, from (date), to (date), q (search term), limit (default 50, max 200)
  - Returns JSON array of show objects
  - CORS enabled (Access-Control-Allow-Origin: *)
  - Example: ${siteUrl}/api/shows/search?state=CA&limit=10

## AI Plugin

- AI Plugin Manifest: ${siteUrl}/.well-known/ai-plugin.json

## Contact

- Email: hello@pokeshows.com
- Website: ${siteUrl}
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
