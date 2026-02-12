import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { gradingLeads } from '@/db/schema';

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  cardCount: z.number().int().min(1).max(10000),
  estimatedValue: z.enum(['under-100', '100-500', '500-2000', '2000-10000', 'over-10000']),
  preferredService: z.enum(['PSA', 'CGC', 'BGS', 'ACE']).nullable().optional(),
  turnaroundPreference: z.enum(['economy', 'standard', 'express']).nullable().optional(),
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

    const { name, email, cardCount, estimatedValue, preferredService, turnaroundPreference } = parsed.data;

    await db.insert(gradingLeads).values({
      name,
      email,
      cardCount,
      estimatedValue,
      preferredService: preferredService || null,
      turnaroundPreference: turnaroundPreference || null,
    });

    // Notify admin via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.ADMIN_EMAIL || 'admin@pokeshows.com';
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'PokeShows <reminders@pokeshows.com>',
            to: [notifyEmail],
            subject: `New Grading Lead: ${cardCount} cards (${estimatedValue}) from ${name}`,
            html: `<h2>New Grading Quote Request</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Cards:</strong> ${cardCount}</p>
<p><strong>Estimated Value:</strong> ${estimatedValue}</p>
<p><strong>Preferred Service:</strong> ${preferredService || 'No preference'}</p>
<p><strong>Turnaround:</strong> ${turnaroundPreference || 'No preference'}</p>`,
          }),
        });
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[grading-leads] Error:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
