import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dealSubscribers } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    try {
      await db.insert(dealSubscribers).values({ email: email.toLowerCase().trim() });
    } catch (err: unknown) {
      // Handle unique constraint - user already subscribed
      if (err instanceof Error && err.message.includes('UNIQUE')) {
        return NextResponse.json({ success: true, message: 'Already subscribed' });
      }
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[deal-subscribe] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
