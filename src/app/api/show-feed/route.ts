import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { showFeedPosts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  displayName: z.string().min(1, 'Display name is required').max(50),
  showSlug: z.string().min(1, 'Show slug is required'),
  type: z.enum(['going', 'bought', 'comment']),
  text: z.string().max(500).optional(),
  cardName: z.string().max(200).optional(),
  pricePaid: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  const showSlug = request.nextUrl.searchParams.get('showSlug');
  if (!showSlug) {
    return NextResponse.json({ error: 'showSlug is required' }, { status: 400 });
  }

  try {
    const posts = await db
      .select()
      .from(showFeedPosts)
      .where(eq(showFeedPosts.showSlug, showSlug))
      .orderBy(desc(showFeedPosts.createdAt))
      .limit(50);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('[show-feed] Failed to fetch posts:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

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

    const { email, displayName, showSlug, type, text, cardName, pricePaid } = parsed.data;

    await db.insert(showFeedPosts).values({
      email,
      displayName,
      showSlug,
      type,
      text: text ?? null,
      cardName: cardName ?? null,
      pricePaid: pricePaid ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[show-feed] Failed to create post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
