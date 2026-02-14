import { Metadata } from 'next';
import { Megaphone, Star, TrendingUp, Users, Mail } from 'lucide-react';
import { SponsorContactForm } from '@/components/sponsors/sponsor-contact-form';
import { CheckoutButton } from '@/components/checkout/checkout-button';
import { SponsorBookButton } from '@/components/sponsors/sponsor-book-button';

export const metadata: Metadata = {
  title: 'Partner with PokeShows — Reach Pokemon Card Collectors',
  description: 'Partner with PokeShows to reach active Pokemon card collectors. Sponsor the Card of the Day, get featured in our vendor directory, or share deals with our community.',
};

const SPONSOR_OPTIONS = [
  {
    title: 'Card of the Day Spotlight',
    price: '$15–50/day',
    checkoutType: 'cotd_sponsorship' as const,
    checkoutLabel: 'Sponsor a Day — $25',
    icon: <Star className="h-6 w-6 text-yellow-500" />,
    benefits: [
      'Pick a card to feature alongside the daily spotlight',
      'Your shop name and link shown to collectors',
      'Great way to showcase your favorite inventory',
      'Seen by hundreds of active collectors daily',
    ],
  },
  {
    title: 'Featured Vendor Listing',
    price: '$10–25/month',
    checkoutType: 'vendor_featured_monthly' as const,
    checkoutLabel: 'Get Featured — $10/mo',
    icon: <TrendingUp className="h-6 w-6 text-green-500" />,
    benefits: [
      'Stand out in the vendor directory with a featured badge',
      'Show up first when collectors browse vendors',
      'Listed on individual show pages you attend',
      'Included in pre-show prep emails to attendees',
    ],
  },
  {
    title: 'Pre-Show Shoutout',
    price: '$5/show',
    checkoutType: 'show_promotion' as const,
    checkoutLabel: 'Promote a Show — $5',
    icon: <Mail className="h-6 w-6 text-blue-500" />,
    benefits: [
      'Your shop featured in show prep emails',
      'Reach collectors 2 days before they head to a show',
      'Perfect for vendors attending specific events',
      'Includes a link to your store or website',
    ],
  },
];

export default function SponsorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Megaphone className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Partner with PokeShows</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Share your cards, deals, and services with collectors who are actively heading to shows. Simple, friendly partnership options for shops and sellers.
        </p>
      </div>

      {/* Audience Stats */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { label: 'Monthly Visitors', value: '5,000+' },
          { label: 'Email Subscribers', value: '500+' },
          { label: 'Shows Listed', value: '200+' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sponsorship Options */}
      <div className="space-y-6 mb-12">
        {SPONSOR_OPTIONS.map(option => (
          <div key={option.title} className="rounded-xl border border-border p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                {option.icon}
                <div>
                  <h2 className="text-lg font-semibold">{option.title}</h2>
                  <p className="text-sm text-primary font-medium">{option.price}</p>
                </div>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              {option.benefits.map(benefit => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <CheckoutButton
                type={option.checkoutType}
                label={option.checkoutLabel}
              />
              <SponsorBookButton
                type={option.checkoutType}
                label="Book Now"
              />
            </div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          How It Works
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { step: '1', title: 'Get in Touch', desc: 'Fill out the form below with what you\'re interested in.' },
            { step: '2', title: 'We Set It Up', desc: 'We\'ll configure your sponsorship within 24 hours.' },
            { step: '3', title: 'Payment', desc: 'Pay via PayPal or Venmo. No contracts, cancel anytime.' },
          ].map(item => (
            <div key={item.step} className="rounded-xl border border-border p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-medium text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section>
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-2">Get Started</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Tell us about your business and which sponsorship options interest you. We&apos;ll get back to you within 24 hours.
          </p>
          <SponsorContactForm />
        </div>
      </section>
    </div>
  );
}
