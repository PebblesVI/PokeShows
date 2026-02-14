import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { affiliateClicks } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const url = searchParams.get('url');
  const dest = searchParams.get('dest');
  const card = searchParams.get('card') || null;
  const cardId = searchParams.get('cardId') || null;
  const source = searchParams.get('source') || '/unknown';
  const cid = searchParams.get('cid') || null;

  if (!url || !dest) {
    return NextResponse.json(
      { error: 'Missing required params: url, dest' },
      { status: 400 },
    );
  }

  // Fire and forget -- log click without awaiting
  db.insert(affiliateClicks)
    .values({
      cardName: card,
      cardId: cardId,
      destination: dest,
      sourcePage: source,
      customId: cid,
    })
    .catch((err) => {
      console.error('[click] Failed to log affiliate click:', err);
    });

  // 302 redirect to the destination URL
  return NextResponse.redirect(url, 302);
}
