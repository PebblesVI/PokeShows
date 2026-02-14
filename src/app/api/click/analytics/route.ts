import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { affiliateClicks } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { format, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const period = searchParams.get('period') || '7d';
    const groupBy = searchParams.get('groupBy') || 'destination';

    // Calculate date filter
    let dateFilter: string | null = null;
    if (period === '7d') {
      dateFilter = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    } else if (period === '30d') {
      dateFilter = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    }
    // 'all' means no date filter

    const dateCondition = dateFilter
      ? sql`WHERE ${affiliateClicks.clickedAt} >= ${dateFilter}`
      : sql``;

    let results;

    if (groupBy === 'destination') {
      results = await db.all(sql`
        SELECT
          ${affiliateClicks.destination} as label,
          COUNT(*) as count
        FROM ${affiliateClicks}
        ${dateCondition}
        GROUP BY ${affiliateClicks.destination}
        ORDER BY count DESC
      `);
    } else if (groupBy === 'sourcePage') {
      results = await db.all(sql`
        SELECT
          ${affiliateClicks.sourcePage} as label,
          COUNT(*) as count
        FROM ${affiliateClicks}
        ${dateCondition}
        GROUP BY ${affiliateClicks.sourcePage}
        ORDER BY count DESC
        LIMIT 50
      `);
    } else if (groupBy === 'day') {
      results = await db.all(sql`
        SELECT
          DATE(${affiliateClicks.clickedAt}) as label,
          COUNT(*) as count
        FROM ${affiliateClicks}
        ${dateCondition}
        GROUP BY DATE(${affiliateClicks.clickedAt})
        ORDER BY label DESC
        LIMIT 90
      `);
    } else {
      return NextResponse.json(
        { error: 'Invalid groupBy. Use: destination, sourcePage, or day' },
        { status: 400 },
      );
    }

    // Also get total count for the period
    const totalResult = await db.all(sql`
      SELECT COUNT(*) as total
      FROM ${affiliateClicks}
      ${dateCondition}
    `);
    const total = (totalResult[0] as { total: number })?.total || 0;

    return NextResponse.json({
      period,
      groupBy,
      total,
      data: results,
    });
  } catch (error) {
    console.error('[click/analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 },
    );
  }
}
