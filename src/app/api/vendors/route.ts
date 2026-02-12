import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { vendors } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

const submitVendorSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters').max(200),
  email: z.string().email('Please enter a valid email address'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  state: z.string().length(2, 'State must be a 2-letter code'),
  city: z.string().max(100).optional(),
  specialties: z.array(z.string()).optional(),
});

function generateVendorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submitVendorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const slug = generateVendorSlug(data.name);

    await db.insert(vendors).values({
      slug,
      name: data.name,
      email: data.email,
      website: data.website || null,
      description: data.description || null,
      state: data.state.toUpperCase(),
      city: data.city || null,
      specialties: data.specialties ? JSON.stringify(data.specialties) : null,
    });

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('[vendors] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('UNIQUE constraint')) {
      return NextResponse.json(
        { error: 'A vendor with this name already exists.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Failed to register vendor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateFilter = searchParams.get('state');

    let results;
    if (stateFilter) {
      results = await db
        .select()
        .from(vendors)
        .where(eq(vendors.state, stateFilter.toUpperCase()))
        .orderBy(desc(vendors.isFeatured), asc(vendors.name));
    } else {
      results = await db
        .select()
        .from(vendors)
        .orderBy(desc(vendors.isFeatured), asc(vendors.name));
    }

    return NextResponse.json({ vendors: results });
  } catch (error) {
    console.error('[vendors] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}
