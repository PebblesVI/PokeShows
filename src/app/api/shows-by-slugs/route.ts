import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { shows } from '@/db/schema';
import { inArray, eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const slugsParam = request.nextUrl.searchParams.get('slugs');
  if (!slugsParam) {
    return NextResponse.json({ shows: [] });
  }

  const slugs = slugsParam.split(',').filter(Boolean).slice(0, 50);
  if (slugs.length === 0) {
    return NextResponse.json({ shows: [] });
  }

  const results = await db.select()
    .from(shows)
    .where(and(inArray(shows.slug, slugs), eq(shows.isActive, true)));

  return NextResponse.json({ shows: results });
}
