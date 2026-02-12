import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { showAlerts } from '@/db/schema';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  state: z.string().min(2, 'State is required').max(2),
  city: z.string().optional().or(z.literal('')),
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

    await db.insert(showAlerts).values({
      email: parsed.data.email,
      state: parsed.data.state.toUpperCase(),
      city: parsed.data.city || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('UNIQUE constraint')) {
      return NextResponse.json({ success: true });
    }
    console.error('[show-alerts] Failed to create alert:', error);
    return NextResponse.json({ error: 'Failed to set alert' }, { status: 500 });
  }
}
