import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { shows } from '@/db/schema';
import { US_STATE_NAMES } from '@/lib/constants';
import { generateShowSlug } from '@/lib/slugify';

const submitShowSchema = z.object({
  name: z.string().min(3, 'Show name must be at least 3 characters').max(200),
  venueName: z.string().min(1, 'Venue name is required').max(200),
  address: z.string().max(300).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().length(2).refine(s => US_STATE_NAMES[s.toUpperCase()], 'Invalid state'),
  zipCode: z.string().max(10).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  startTime: z.string().max(20).optional(),
  endTime: z.string().max(20).optional(),
  admissionPrice: z.string().max(50).optional(),
  organizerName: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  eventType: z.enum(['card_show', 'convention', 'tournament', 'meetup']).default('card_show'),
  isPokemonSpecific: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submitShowSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const stateUpper = data.state.toUpperCase();
    const slug = generateShowSlug(data.name, data.startDate);

    await db.insert(shows).values({
      slug,
      name: data.name,
      description: data.description || null,
      venueName: data.venueName,
      address: data.address || null,
      city: data.city,
      state: stateUpper,
      stateFullName: US_STATE_NAMES[stateUpper] || null,
      zipCode: data.zipCode || null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      admissionPrice: data.admissionPrice || null,
      organizerName: data.organizerName || null,
      websiteUrl: data.websiteUrl || null,
      eventType: data.eventType,
      isPokemonSpecific: data.isPokemonSpecific,
      sourceId: `submit-${Date.now()}`,
      sourceName: 'user_submission',
      isActive: true,
    });

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('[submit-show] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'A show with this name and date already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to submit show' }, { status: 500 });
  }
}
