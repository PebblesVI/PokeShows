import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers } from '@/scrapers/runner';
import { deactivatePastShows } from '@/db/queries/shows';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Step 1: Auto-expire past shows
    console.log('[cron/scrape-shows] Deactivating past shows...');
    await deactivatePastShows();

    // Step 2: Run scraper pipeline
    console.log('[cron/scrape-shows] Starting scraper pipeline...');
    const result = await runAllScrapers();

    return NextResponse.json({
      success: true,
      ...result,
      message: `Scraper pipeline complete. Total: ${result.total}, Created: ${result.created}, Updated: ${result.updated}`,
    });
  } catch (error) {
    console.error('[cron/scrape-shows] Pipeline failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
