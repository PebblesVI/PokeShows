import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { sponsorRequests } from '@/db/schema';

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  businessName: z.string().max(200).optional().default(''),
  sponsorType: z.enum(['cotd', 'vendor', 'general']),
  message: z.string().max(2000).optional().default(''),
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

    const { name, email, businessName, sponsorType, message } = parsed.data;

    await db.insert(sponsorRequests).values({
      name,
      email,
      businessName: businessName || null,
      sponsorType,
      message: message || null,
    });

    // Notify via Resend
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
            subject: `New Sponsor Request: ${sponsorType} from ${name}`,
            html: `<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Business:</strong> ${businessName || 'N/A'}</p>
<p><strong>Type:</strong> ${sponsorType}</p>
<p><strong>Message:</strong> ${message || 'N/A'}</p>`,
          }),
        });
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[sponsor-request] Error:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
