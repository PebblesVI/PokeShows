import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { organizerFollows } from '@/db/schema';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  organizerName: z.string().min(1, 'Organizer name is required'),
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

    await db.insert(organizerFollows).values({
      email: parsed.data.email,
      organizerName: parsed.data.organizerName,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('UNIQUE constraint')) {
      return NextResponse.json({ success: true });
    }
    console.error('[organizer-follows] Failed to create follow:', error);
    return NextResponse.json({ error: 'Failed to follow organizer' }, { status: 500 });
  }
}
