import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { showReminders, shows } from '@/db/schema';
import { eq } from 'drizzle-orm';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  showSlug: z.string().min(1, 'Show slug is required'),
  remindBefore: z.enum(['1d', '3d', '7d']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    // Verify the show exists
    const show = await db.query.shows.findFirst({
      where: eq(shows.slug, parsed.data.showSlug),
    });

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    await db.insert(showReminders).values({
      email: parsed.data.email,
      showSlug: parsed.data.showSlug,
      remindBefore: parsed.data.remindBefore,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('UNIQUE constraint')) {
      return NextResponse.json({ success: true }); // Already set, still return success
    }
    console.error('[reminders] Failed to create reminder:', error);
    return NextResponse.json({ error: 'Failed to set reminder' }, { status: 500 });
  }
}
