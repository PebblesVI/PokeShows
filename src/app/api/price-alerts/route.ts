import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { priceAlerts } from '@/db/schema';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  pokemonTcgId: z.string().min(1, 'Card ID is required'),
  cardName: z.string().min(1, 'Card name is required'),
  targetPrice: z.number().positive('Target price must be positive'),
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

    await db.insert(priceAlerts).values({
      email: parsed.data.email,
      pokemonTcgId: parsed.data.pokemonTcgId,
      cardName: parsed.data.cardName,
      targetPrice: parsed.data.targetPrice,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('UNIQUE constraint')) {
      return NextResponse.json({ success: true }); // Already set
    }
    console.error('[price-alerts] Failed to create alert:', error);
    return NextResponse.json({ error: 'Failed to set alert' }, { status: 500 });
  }
}
