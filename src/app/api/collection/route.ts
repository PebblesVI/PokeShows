import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { collectionCards } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const addCardSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  pokemonTcgId: z.string().min(1, 'Card ID is required'),
  cardName: z.string().min(1, 'Card name is required'),
  setName: z.string().min(1, 'Set name is required'),
  setId: z.string().min(1, 'Set ID is required'),
  imageSmall: z.string().url('Image URL is required'),
  rarity: z.string().nullable().optional(),
  variant: z.string().nullable().optional(),
  pricePaid: z.number().nullable().optional(),
});

const removeCardSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  pokemonTcgId: z.string().min(1, 'Card ID is required'),
});

const toggleTradeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  pokemonTcgId: z.string().min(1, 'Card ID is required'),
  forTrade: z.boolean(),
});

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const setId = request.nextUrl.searchParams.get('setId');

  try {
    let cards;
    if (setId) {
      cards = await db
        .select()
        .from(collectionCards)
        .where(
          and(
            eq(collectionCards.email, email),
            eq(collectionCards.setId, setId),
          ),
        );
    } else {
      cards = await db
        .select()
        .from(collectionCards)
        .where(eq(collectionCards.email, email));
    }

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('[collection] Failed to fetch cards:', error);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a toggle-trade request
    if ('forTrade' in body) {
      const parsed = toggleTradeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 },
        );
      }

      await db
        .update(collectionCards)
        .set({ forTrade: parsed.data.forTrade })
        .where(
          and(
            eq(collectionCards.email, parsed.data.email),
            eq(collectionCards.pokemonTcgId, parsed.data.pokemonTcgId),
          ),
        );

      return NextResponse.json({ success: true });
    }

    // Otherwise it's an add-card request
    const parsed = addCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    await db
      .insert(collectionCards)
      .values({
        email: parsed.data.email,
        pokemonTcgId: parsed.data.pokemonTcgId,
        cardName: parsed.data.cardName,
        setName: parsed.data.setName,
        setId: parsed.data.setId,
        imageSmall: parsed.data.imageSmall,
        rarity: parsed.data.rarity ?? null,
        variant: parsed.data.variant ?? null,
        pricePaid: parsed.data.pricePaid ?? null,
      })
      .onConflictDoUpdate({
        target: [collectionCards.email, collectionCards.pokemonTcgId],
        set: {
          cardName: parsed.data.cardName,
          setName: parsed.data.setName,
          setId: parsed.data.setId,
          imageSmall: parsed.data.imageSmall,
          rarity: parsed.data.rarity ?? null,
          variant: parsed.data.variant ?? null,
          pricePaid: parsed.data.pricePaid ?? null,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[collection] Failed to add/update card:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = removeCardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    await db
      .delete(collectionCards)
      .where(
        and(
          eq(collectionCards.email, parsed.data.email),
          eq(collectionCards.pokemonTcgId, parsed.data.pokemonTcgId),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[collection] Failed to remove card:', error);
    return NextResponse.json({ error: 'Failed to remove card' }, { status: 500 });
  }
}
