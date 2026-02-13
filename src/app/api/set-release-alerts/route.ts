import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { setReleaseAlerts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

const postSchema = z.object({
  email: z.string().email(),
  setId: z.string().min(1),
  setName: z.string().min(1),
  releaseDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, setId, setName, releaseDate } = parsed.data;

    // Upsert: insert or ignore on conflict (email + setId unique constraint)
    await db.insert(setReleaseAlerts)
      .values({
        email,
        setId,
        setName,
        releaseDate: releaseDate ?? null,
        sent: false,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[set-release-alerts] POST error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const setId = searchParams.get('setId');

    if (!setId) {
      return NextResponse.json({ error: 'setId is required' }, { status: 400 });
    }

    const result = await db.select({
      count: sql<number>`count(*)`,
    })
      .from(setReleaseAlerts)
      .where(eq(setReleaseAlerts.setId, setId));

    const count = result[0]?.count ?? 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error('[set-release-alerts] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}
