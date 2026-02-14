import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { payments, proSubscriptions, vendors, shows, cardOfTheDay } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('[stripe-webhook] Missing signature or webhook secret');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe-webhook] Signature verification failed:', message);
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }
      default: {
        // Unhandled event type — log but don't error
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe-webhook] Error processing event:', error);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const type = session.metadata?.type;
  const email = session.metadata?.email || session.customer_email || '';

  if (!type) {
    console.warn('[stripe-webhook] checkout.session.completed missing type in metadata');
    return;
  }

  // Mark payment as completed
  if (session.id) {
    await db
      .update(payments)
      .set({
        status: 'completed',
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null,
      })
      .where(eq(payments.stripeSessionId, session.id));
  }

  switch (type) {
    case 'vendor_featured_monthly': {
      await handleVendorFeatured(session.metadata!, 30);
      break;
    }
    case 'vendor_featured_show': {
      // For per-show, get the show end date or default to 30 days
      const showSlug = session.metadata?.showSlug;
      if (showSlug) {
        const [show] = await db
          .select({ endDate: shows.endDate, startDate: shows.startDate })
          .from(shows)
          .where(eq(shows.slug, showSlug))
          .limit(1);

        const endDate = show?.endDate || show?.startDate;
        if (endDate) {
          // Set featured until the day after the show ends
          const showEnd = new Date(endDate);
          showEnd.setDate(showEnd.getDate() + 1);
          await handleVendorFeaturedUntil(session.metadata!, showEnd.toISOString());
        } else {
          await handleVendorFeatured(session.metadata!, 30);
        }
      } else {
        await handleVendorFeatured(session.metadata!, 30);
      }
      break;
    }
    case 'cotd_sponsorship': {
      await handleCotdSponsorship(session.metadata!);
      break;
    }
    case 'show_promotion': {
      await handleShowPromotion(session.metadata!);
      break;
    }
    case 'pro_monthly': {
      await handleProSubscription(session, email);
      break;
    }
    default: {
      console.warn(`[stripe-webhook] Unknown payment type: ${type}`);
    }
  }

  // Send confirmation email
  await sendConfirmationEmail(email, type);
}

async function handleVendorFeatured(metadata: Stripe.Metadata, days: number) {
  const vendorSlug = metadata.vendorSlug;
  if (!vendorSlug) return;

  const featuredUntil = new Date();
  featuredUntil.setDate(featuredUntil.getDate() + days);

  await db
    .update(vendors)
    .set({
      isFeatured: true,
      featuredUntil: featuredUntil.toISOString(),
    })
    .where(eq(vendors.slug, vendorSlug));
}

async function handleVendorFeaturedUntil(metadata: Stripe.Metadata, until: string) {
  const vendorSlug = metadata.vendorSlug;
  if (!vendorSlug) return;

  await db
    .update(vendors)
    .set({
      isFeatured: true,
      featuredUntil: until,
    })
    .where(eq(vendors.slug, vendorSlug));
}

async function handleCotdSponsorship(metadata: Stripe.Metadata) {
  const sponsorDate = metadata.sponsorDate;
  const sponsorName = metadata.sponsorName || '';
  const sponsorUrl = metadata.sponsorUrl || '';

  if (!sponsorDate) return;

  await db
    .update(cardOfTheDay)
    .set({
      isSponsored: true,
      sponsorName,
      sponsorUrl,
    })
    .where(eq(cardOfTheDay.featuredDate, sponsorDate));
}

async function handleShowPromotion(metadata: Stripe.Metadata) {
  const showSlug = metadata.showSlug;
  if (!showSlug) return;

  await db
    .update(shows)
    .set({ isFeatured: true })
    .where(eq(shows.slug, showSlug));
}

async function handleProSubscription(session: Stripe.Checkout.Session, email: string) {
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id;

  // Calculate period end — 30 days from now as fallback
  let periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  // If we have the subscription, get the actual period end
  if (subscriptionId) {
    try {
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items'] });
      const firstItem = subscription.items?.data?.[0];
      if (firstItem?.current_period_end) {
        periodEnd = new Date(firstItem.current_period_end * 1000);
      }
    } catch {
      // Use fallback
    }
  }

  // Upsert the pro subscription
  const existing = await db
    .select({ id: proSubscriptions.id })
    .from(proSubscriptions)
    .where(eq(proSubscriptions.email, email))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(proSubscriptions)
      .set({
        stripeCustomerId: customerId || null,
        stripeSubscriptionId: subscriptionId || null,
        status: 'active',
        currentPeriodEnd: periodEnd.toISOString(),
      })
      .where(eq(proSubscriptions.email, email));
  } else {
    await db.insert(proSubscriptions).values({
      email,
      stripeCustomerId: customerId || null,
      stripeSubscriptionId: subscriptionId || null,
      status: 'active',
      plan: 'monthly',
      currentPeriodEnd: periodEnd.toISOString(),
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  await db
    .update(proSubscriptions)
    .set({ status: 'canceled' })
    .where(eq(proSubscriptions.stripeSubscriptionId, subscriptionId));
}

async function sendConfirmationEmail(email: string, type: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || !email) return;

  const typeLabels: Record<string, string> = {
    vendor_featured_monthly: 'Featured Vendor (Monthly)',
    vendor_featured_show: 'Featured Vendor (Per Show)',
    cotd_sponsorship: 'Card of the Day Sponsorship',
    show_promotion: 'Show Promotion',
    pro_monthly: 'PokeShows Pro Subscription',
  };

  const label = typeLabels[type] || type;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'PokeShows <reminders@pokeshows.com>',
        to: [email],
        subject: `Payment Confirmed — ${label}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Payment Confirmed!</h2>
            <p>Thanks for your purchase of <strong>${label}</strong> on PokeShows.</p>
            <p>Your payment has been processed successfully. If you have any questions, reply to this email.</p>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">— The PokeShows Team</p>
          </div>
        `,
      }),
    });
  } catch {
    // Non-critical — don't fail the webhook
  }
}
