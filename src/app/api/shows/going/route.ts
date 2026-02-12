import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { showCheckins } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

const postSchema = z.object({
  showSlug: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  action: z.enum(['add', 'remove']),
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

    const { showSlug, email, action } = parsed.data;
    const userEmail = email || 'anonymous';

    if (action === 'add') {
      await db.insert(showCheckins).values({
        email: userEmail,
        showSlug,
      });
    } else {
      await db.delete(showCheckins).where(
        and(eq(showCheckins.email, userEmail), eq(showCheckins.showSlug, showSlug)),
      );
    }

    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(showCheckins)
      .where(eq(showCheckins.showSlug, showSlug));

    return NextResponse.json({ success: true, count: result?.count ?? 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('UNIQUE constraint')) {
      // Already checked in
      return NextResponse.json({ success: true });
    }
    console.error('[going] Error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const [result] = await db.select({ count: sql<number>`count(*)` })
    .from(showCheckins)
    .where(eq(showCheckins.showSlug, slug));

  return NextResponse.json({ count: result?.count ?? 0 });
}
