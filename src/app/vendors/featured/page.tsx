import { Metadata } from 'next';
import Link from 'next/link';
import { Star, Check, Users, Mail, MapPin, TrendingUp } from 'lucide-react';
import { SponsorContactForm } from '@/components/sponsors/sponsor-contact-form';

export const metadata: Metadata = {
  title: 'Get Featured — Stand Out on PokeShows',
  description: 'Get a Featured Vendor listing on PokeShows. Stand out to collectors with top placement, show page presence, and pre-show email inclusion.',
};

const BENEFITS = [
  {
    icon: <Star className="h-5 w-5 text-yellow-500" />,
    title: 'Yellow "Featured" Badge',
    desc: 'Eye-catching yellow border and badge that sets you apart from standard listings.',
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
    title: 'Top Placement',
    desc: 'Your listing appears above all non-featured vendors, maximizing visibility.',
  },
  {
    icon: <MapPin className="h-5 w-5 text-blue-500" />,
    title: 'Show Page Presence',
    desc: 'Listed in the "Vendors at This Show" section on individual show detail pages.',
  },
  {
    icon: <Mail className="h-5 w-5 text-purple-500" />,
    title: 'Pre-Show Kit Emails',
    desc: 'Featured in prep kit emails sent to collectors 2 days before shows you attend.',
  },
  {
    icon: <Users className="h-5 w-5 text-orange-500" />,
    title: 'Connect with Collectors',
    desc: 'PokeShows users are actively attending shows and looking for great vendors to buy from.',
  },
];

const PRICING = [
  {
    name: 'Monthly',
    price: '$10',
    period: '/month',
    features: ['Featured on all vendor pages', 'Show page presence', 'Pre-show email inclusion', 'Cancel anytime'],
    popular: true,
  },
  {
    name: 'Per Show',
    price: '$5',
    period: '/show',
    features: ['Featured for one show', 'Listed on that show\'s page', 'Included in that show\'s prep email', 'Great for traveling vendors'],
    popular: false,
  },
];

export default function FeaturedVendorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star className="h-7 w-7 text-yellow-500" />
          <h1 className="text-3xl font-bold">Get Featured on PokeShows</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Help collectors find you! A featured listing puts your shop front and center for show-goers in your area.
        </p>
      </div>

      {/* Benefits */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-center">What You Get</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(benefit => (
            <div key={benefit.title} className="rounded-xl border border-border p-4">
              <div className="mb-2">{benefit.icon}</div>
              <h3 className="font-medium text-sm mb-1">{benefit.title}</h3>
              <p className="text-xs text-muted-foreground">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-center">Simple Pricing</h2>
        <div className="grid gap-6 sm:grid-cols-2 max-w-xl mx-auto">
          {PRICING.map(plan => (
            <div
              key={plan.name}
              className={`rounded-xl border-2 p-6 ${plan.popular ? 'border-yellow-400 bg-yellow-50/30 dark:bg-yellow-900/10' : 'border-border'}`}
            >
              {plan.popular && (
                <span className="inline-block text-xs font-semibold text-yellow-700 dark:text-yellow-400 bg-yellow-200/50 dark:bg-yellow-800/30 px-2 py-0.5 rounded-full mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          No contracts. Pay via PayPal or Venmo. We activate your listing within 24 hours.
        </p>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <ol className="space-y-3">
          {[
            'Fill out the form below (or email us directly)',
            'We\'ll confirm your listing details and payment method',
            'Pay via PayPal or Venmo — no credit card needed',
            'Your featured listing goes live within 24 hours',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <span className="text-sm">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Contact Form */}
      <section>
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-2">Get Started</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Tell us about your vendor business. Already registered?{' '}
            <Link href="/vendors" className="text-primary hover:underline">Check the directory</Link>.
          </p>
          <SponsorContactForm />
        </div>
      </section>
    </div>
  );
}
