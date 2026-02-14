import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

// Price IDs — configured in the Stripe Dashboard, referenced via env vars
export const STRIPE_VENDOR_FEATURED_MONTHLY_PRICE = process.env.STRIPE_VENDOR_FEATURED_MONTHLY_PRICE_ID;
export const STRIPE_VENDOR_FEATURED_SHOW_PRICE = process.env.STRIPE_VENDOR_FEATURED_SHOW_PRICE_ID;
export const STRIPE_COTD_SPONSORSHIP_PRICE = process.env.STRIPE_COTD_SPONSORSHIP_PRICE_ID;
export const STRIPE_SHOW_PROMOTION_PRICE = process.env.STRIPE_SHOW_PROMOTION_PRICE_ID;
export const STRIPE_PRO_MONTHLY_PRICE = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
