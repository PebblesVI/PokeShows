import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { wishlistAlerts } from '@/db/schema';
import { eq } from 'drizzle-orm';

const schema = z.object({
  email: z.string().email(),
  cardIds: z.array(z.string()).min(1).max(100),
  thresholdPercent: z.number().int().min(1).max(50).optional().default(10),
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

    const { email, cardIds, thresholdPercent } = parsed.data;

    // Upsert: update card list if email already exists
    const existing = await db.query.wishlistAlerts.findFirst({
      where: eq(wishlistAlerts.email, email),
    });

    if (existing) {
      await db.update(wishlistAlerts)
        .set({
          cardIds: JSON.stringify(cardIds),
          thresholdPercent,
        })
        .where(eq(wishlistAlerts.id, existing.id));
    } else {
      await db.insert(wishlistAlerts).values({
        email,
        cardIds: JSON.stringify(cardIds),
        thresholdPercent,
        alertType: 'price_drop',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[wishlist-alerts] Error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
