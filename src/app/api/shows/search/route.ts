import { NextRequest } from 'next/server';
import { db } from '@/db';
import { shows } from '@/db/schema';
import { eq, and, gte, lte, asc, like, or } from 'drizzle-orm';
import { format } from 'date-fns';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  try {
    const { searchParams } = request.nextUrl;
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const q = searchParams.get('q');
    const limitParam = searchParams.get('limit');

    let limit = 50;
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 200);
      }
    }

    const conditions = [eq(shows.isActive, true)];

    if (state) {
      conditions.push(eq(shows.state, state.toUpperCase()));
    }

    if (city) {
      conditions.push(like(shows.city, city));
    }

    if (from) {
      conditions.push(gte(shows.startDate, from));
    } else {
      conditions.push(gte(shows.startDate, format(new Date(), 'yyyy-MM-dd')));
    }

    if (to) {
      conditions.push(lte(shows.startDate, to));
    }

    if (q) {
      const searchTerm = `%${q}%`;
      conditions.push(
        or(
          like(shows.name, searchTerm),
          like(shows.city, searchTerm),
          like(shows.venueName, searchTerm),
          like(shows.organizerName, searchTerm),
        )!,
      );
    }

    const results = await db
      .select({
        name: shows.name,
        slug: shows.slug,
        city: shows.city,
        state: shows.state,
        startDate: shows.startDate,
        endDate: shows.endDate,
        venueName: shows.venueName,
        startTime: shows.startTime,
        endTime: shows.endTime,
        admissionPrice: shows.admissionPrice,
        organizerName: shows.organizerName,
        websiteUrl: shows.websiteUrl,
      })
      .from(shows)
      .where(and(...conditions))
      .orderBy(asc(shows.startDate))
      .limit(limit);

    const data = results.map((show) => ({
      ...show,
      url: `${siteUrl}/shows/${show.slug}`,
    }));

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        Link: `<${siteUrl}/llms.txt>; rel="describedby"; type="text/plain"`,
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.error('Shows search API error:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while searching for shows.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      },
    );
  }
}
