import { Metadata } from 'next';
import { Megaphone, Star, TrendingUp, Users, Mail } from 'lucide-react';
import { SponsorContactForm } from '@/components/sponsors/sponsor-contact-form';

export const metadata: Metadata = {
  title: 'Advertise with PokeShows — Reach Pokemon Card Collectors',
  description: 'Sponsor the Card of the Day, get featured in our vendor directory, or reach collectors through targeted email. Affordable advertising for card shops and sellers.',
};

const SPONSOR_OPTIONS = [
  {
    title: 'Sponsored Card of the Day',
    price: '$15–50/day',
    icon: <Star className="h-6 w-6 text-yellow-500" />,
    benefits: [
      'Your card featured alongside the daily pick',
      '"Sponsored" badge with your store name and link',
      'Earn affiliate commission on eBay clicks',
      'Seen by hundreds of active collectors daily',
    ],
  },
  {
    title: 'Featured Vendor Listing',
    price: '$10–25/month',
    icon: <TrendingUp className="h-6 w-6 text-green-500" />,
    benefits: [
      'Yellow border + "Featured" badge in vendor directory',
      'Top placement above all other vendors',
      'Included in show-specific vendor sections',
      'Mentioned in pre-show kit emails',
    ],
  },
  {
    title: 'Pre-Show Kit Sponsorship',
    price: '$5/show',
    icon: <Mail className="h-6 w-6 text-blue-500" />,
    benefits: [
      'Your store featured in pre-show prep emails',
      'Reach users 2 days before they attend a show',
      'High-intent audience about to spend money',
      'Includes link to your eBay store or website',
    ],
  },
];

export default function SponsorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Megaphone className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Advertise with PokeShows</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Reach thousands of active Pokemon card collectors and show attendees. Affordable advertising options for card shops, eBay sellers, and grading services.
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
            <ul className="space-y-2">
              {option.benefits.map(benefit => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                  {benefit}
                </li>
              ))}
            </ul>
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
