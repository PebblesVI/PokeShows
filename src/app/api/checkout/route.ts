import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { payments } from '@/db/schema';
import {
  getStripe,
  isStripeConfigured,
  STRIPE_VENDOR_FEATURED_MONTHLY_PRICE,
  STRIPE_VENDOR_FEATURED_SHOW_PRICE,
  STRIPE_COTD_SPONSORSHIP_PRICE,
  STRIPE_SHOW_PROMOTION_PRICE,
  STRIPE_PRO_MONTHLY_PRICE,
} from '@/lib/stripe';

const checkoutSchema = z.object({
  email: z.string().email('A valid email is required'),
  type: z.enum([
    'vendor_featured_monthly',
    'vendor_featured_show',
    'cotd_sponsorship',
    'show_promotion',
    'pro_monthly',
  ]),
  metadata: z.record(z.string(), z.string()).optional(),
});

const SUBSCRIPTION_TYPES = new Set(['vendor_featured_monthly', 'pro_monthly']);

const PRICE_MAP: Record<string, string | undefined> = {
  vendor_featured_monthly: STRIPE_VENDOR_FEATURED_MONTHLY_PRICE,
  vendor_featured_show: STRIPE_VENDOR_FEATURED_SHOW_PRICE,
  cotd_sponsorship: STRIPE_COTD_SPONSORSHIP_PRICE,
  show_promotion: STRIPE_SHOW_PROMOTION_PRICE,
  pro_monthly: STRIPE_PRO_MONTHLY_PRICE,
};

const AMOUNT_MAP: Record<string, number> = {
  vendor_featured_monthly: 1000, // $10/month
  vendor_featured_show: 500,     // $5/show
  cotd_sponsorship: 2500,        // $25/day
  show_promotion: 500,           // $5/show
  pro_monthly: 499,              // $4.99/month
};

const LABEL_MAP: Record<string, string> = {
  vendor_featured_monthly: 'Featured Vendor — Monthly',
  vendor_featured_show: 'Featured Vendor — Per Show',
  cotd_sponsorship: 'Card of the Day Sponsorship',
  show_promotion: 'Show Promotion',
  pro_monthly: 'PokeShows Pro — Monthly',
};

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payments coming soon', fallback: '/sponsors' },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, type, metadata: extraMetadata } = parsed.data;

    const priceId = PRICE_MAP[type];
    if (!priceId) {
      return NextResponse.json(
        { error: `Price not configured for ${type}. Contact us to set it up.` },
        { status: 400 },
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
    const isSubscription = SUBSCRIPTION_TYPES.has(type);

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/checkout/success?type=${type}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/success?canceled=true&type=${type}`,
      metadata: {
        type,
        email,
        ...(extraMetadata || {}),
      },
    });

    // Store a pending payment row
    await db.insert(payments).values({
      email,
      stripeSessionId: session.id,
      amount: AMOUNT_MAP[type] || 0,
      currency: 'usd',
      type,
      metadata: extraMetadata ? JSON.stringify(extraMetadata) : null,
      status: 'pending',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[checkout] Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
