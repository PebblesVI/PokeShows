import { db } from '@/db';
import { shows } from '@/db/schema';
import { eq, gte, and, asc } from 'drizzle-orm';
import { format } from 'date-fns';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  const today = format(new Date(), 'yyyy-MM-dd');

  const upcomingShows = await db
    .select()
    .from(shows)
    .where(
      and(
        eq(shows.isActive, true),
        gte(shows.startDate, today)
      )
    )
    .orderBy(asc(shows.startDate))
    .limit(100);

  const items = upcomingShows
    .map((show) => {
      const dateStr = format(new Date(show.startDate), 'MMMM d, yyyy');
      const link = `${siteUrl}/shows/${show.slug}`;
      const description = `${show.name} in ${show.city}, ${show.state} on ${dateStr}.${show.venueName ? ` Venue: ${show.venueName}.` : ''}${show.admissionPrice ? ` Admission: ${show.admissionPrice}.` : ''}`;

      return `    <item>
      <title><![CDATA[${show.name}]]></title>
      <link>${link}</link>
      <description><![CDATA[${description}]]></description>
      <pubDate>${new Date(show.createdAt).toUTCString()}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PokeShows — Pokemon &amp; Trading Card Shows</title>
    <link>${siteUrl}</link>
    <description>Upcoming Pokemon and trading card shows across the United States.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
