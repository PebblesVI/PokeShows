import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { ExternalLink, Shield, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pokemon Card Grading Guide — Compare PSA, CGC, BGS, ACE',
  description: 'Compare grading services, costs, and turnaround times. Find the best option for grading your Pokemon cards.',
};

const GRADING_SERVICES = [
  {
    name: 'PSA',
    fullName: 'Professional Sports Authenticator',
    description: 'The most recognized grading company. PSA-graded cards typically command the highest premiums.',
    tiers: [
      { name: 'Value', price: '$25/card', turnaround: '65 business days' },
      { name: 'Regular', price: '$50/card', turnaround: '35 business days' },
      { name: 'Express', price: '$100/card', turnaround: '15 business days' },
      { name: 'Super Express', price: '$200/card', turnaround: '5 business days' },
    ],
    website: 'https://www.psacard.com',
    searchQuery: 'PSA graded pokemon card',
  },
  {
    name: 'CGC',
    fullName: 'Certified Guaranty Company',
    description: 'Known for consistent grading and sub-grades. Growing rapidly in popularity for Pokemon cards.',
    tiers: [
      { name: 'Economy', price: '$15/card', turnaround: '75 business days' },
      { name: 'Standard', price: '$30/card', turnaround: '40 business days' },
      { name: 'Express', price: '$65/card', turnaround: '10 business days' },
      { name: 'Walk-Through', price: '$150/card', turnaround: '2 business days' },
    ],
    website: 'https://www.cgccards.com',
    searchQuery: 'CGC graded pokemon card',
  },
  {
    name: 'BGS',
    fullName: 'Beckett Grading Services',
    description: 'Offers sub-grades for centering, corners, edges, and surface. A BGS 10 "Black Label" is one of the most coveted grades.',
    tiers: [
      { name: 'Economy', price: '$25/card', turnaround: '50+ business days' },
      { name: 'Standard', price: '$50/card', turnaround: '30 business days' },
      { name: 'Express', price: '$100/card', turnaround: '10 business days' },
      { name: 'Premium', price: '$250/card', turnaround: '5 business days' },
    ],
    website: 'https://www.beckett.com/grading',
    searchQuery: 'BGS Beckett graded pokemon card',
  },
  {
    name: 'ACE',
    fullName: 'ACE Grading',
    description: 'Newer grading company with modern slabs and competitive pricing.',
    tiers: [
      { name: 'Standard', price: '$18/card', turnaround: '45 business days' },
      { name: 'Express', price: '$40/card', turnaround: '15 business days' },
      { name: 'Premium', price: '$75/card', turnaround: '5 business days' },
    ],
    website: 'https://www.acegrading.com',
    searchQuery: 'ACE graded pokemon card',
  },
];

const GRADING_TIPS = [
  {
    title: 'Inspect Before Submitting',
    tip: 'Use a loupe or magnifying glass to check for surface scratches, whitening on edges, and centering issues before paying for grading.',
  },
  {
    title: 'Choose the Right Service Level',
    tip: 'For cards worth under $100, economy tiers make the most sense. Save express services for high-value cards where quick turnaround matters.',
  },
  {
    title: 'Clean Your Cards Properly',
    tip: 'Use a microfiber cloth to gently remove dust and fingerprints. Never use liquids or chemicals on your cards.',
  },
  {
    title: 'Consider the Market',
    tip: 'PSA-graded cards generally sell for the highest premiums, but CGC is gaining traction and costs less to submit.',
  },
  {
    title: 'Protect During Shipping',
    tip: 'Use penny sleeves, toploaders, and team bags when shipping cards for grading. Add padding and use a sturdy box.',
  },
  {
    title: 'Group Submissions',
    tip: 'Most grading companies offer bulk discounts. Coordinate with friends or your local community to submit cards together and save.',
  },
];

export default function GradingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Pokemon Card Grading Guide</h1>
        </div>
        <p className="text-muted-foreground">
          Compare grading services, costs, and turnaround times. Find the best option for grading your Pokemon cards.
        </p>
      </div>

      {/* Grading Services */}
      <div className="space-y-6 mb-12">
        {GRADING_SERVICES.map((service) => (
          <div key={service.name} className="rounded-xl border border-border p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-xl font-bold">{service.name}</h2>
                <p className="text-sm text-muted-foreground">{service.fullName}</p>
              </div>
              <Badge variant="secondary" className="rounded-full text-xs shrink-0">
                {service.tiers.length} tiers
              </Badge>
            </div>

            <p className="text-sm mb-4">{service.description}</p>

            {/* Pricing Tiers Table */}
            <div className="rounded-lg border border-border overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left px-4 py-2.5 font-medium">Service Level</th>
                    <th className="text-left px-4 py-2.5 font-medium">Price</th>
                    <th className="text-left px-4 py-2.5 font-medium">Turnaround</th>
                  </tr>
                </thead>
                <tbody>
                  {service.tiers.map((tier, i) => (
                    <tr
                      key={tier.name}
                      className={i % 2 === 0 ? '' : 'bg-muted/10'}
                    >
                      <td className="px-4 py-2.5">{tier.name}</td>
                      <td className="px-4 py-2.5 font-medium">{tier.price}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{tier.turnaround}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={buildEbaySearchUrl({ searchQuery: service.searchQuery, customId: `grading-${service.name.toLowerCase()}` })}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Browse {service.name} Cards on eBay
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={service.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/30 transition-colors"
              >
                Visit {service.name} Website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Comparison */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Quick Comparison</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left px-4 py-3 font-medium">Service</th>
                <th className="text-left px-4 py-3 font-medium">Starting Price</th>
                <th className="text-left px-4 py-3 font-medium">Fastest Option</th>
                <th className="text-left px-4 py-3 font-medium">Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 font-medium">PSA</td>
                <td className="px-4 py-3">$25/card</td>
                <td className="px-4 py-3">5 business days</td>
                <td className="px-4 py-3 text-muted-foreground">Highest resale value</td>
              </tr>
              <tr className="bg-muted/10">
                <td className="px-4 py-3 font-medium">CGC</td>
                <td className="px-4 py-3">$15/card</td>
                <td className="px-4 py-3">2 business days</td>
                <td className="px-4 py-3 text-muted-foreground">Budget-friendly, sub-grades</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">BGS</td>
                <td className="px-4 py-3">$25/card</td>
                <td className="px-4 py-3">5 business days</td>
                <td className="px-4 py-3 text-muted-foreground">Sub-grades, Black Labels</td>
              </tr>
              <tr className="bg-muted/10">
                <td className="px-4 py-3 font-medium">ACE</td>
                <td className="px-4 py-3">$18/card</td>
                <td className="px-4 py-3">5 business days</td>
                <td className="px-4 py-3 text-muted-foreground">Modern slabs, competitive pricing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Grading Tips */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Grading Tips</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {GRADING_TIPS.map((item) => (
            <div key={item.title} className="rounded-xl border border-border p-4">
              <h3 className="font-medium mb-1 text-sm">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
