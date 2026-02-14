import { Metadata } from 'next';
import { ExternalLink, Tag, Star, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { buildTcgPlayerSearchUrl } from '@/lib/tcgplayer-affiliate';
import Link from 'next/link';
import { DynamicDeals } from './dynamic-deals';

export const metadata: Metadata = {
  title: 'Partner Deals — Pokemon Card Discounts & Offers',
  description: 'Exclusive deals from our partners on Pokemon cards, supplies, grading services, and more. Curated offers for the PokeShows community.',
};

// 4 evergreen supply deals
const EVERGREEN_DEALS: {
  title: string;
  partner: string;
  description: string;
  ebayUrl: string;
  tcgPlayerUrl: string;
  badge?: string;
  category: string;
}[] = [
  {
    title: 'Card Sleeves & Penny Sleeves',
    partner: 'eBay + TCGPlayer',
    description: 'Stock up on penny sleeves to protect your cards. Essential for any collector building a show haul.',
    ebayUrl: buildEbaySearchUrl({ searchQuery: 'pokemon card penny sleeves bulk', customId: 'deals-sleeves' }),
    tcgPlayerUrl: buildTcgPlayerSearchUrl('pokemon card sleeves'),
    badge: 'Essential',
    category: 'Supplies',
  },
  {
    title: 'Ultra Pro Top Loaders (35pt)',
    partner: 'eBay + TCGPlayer',
    description: 'Rigid top loaders for your valuable pulls. 35pt is the standard for most Pokemon cards.',
    ebayUrl: buildEbaySearchUrl({ searchQuery: 'ultra pro top loaders 35pt', customId: 'deals-toploaders' }),
    tcgPlayerUrl: buildTcgPlayerSearchUrl('ultra pro top loaders 35pt'),
    badge: 'Popular',
    category: 'Supplies',
  },
  {
    title: 'PSA Graded Card Storage Cases',
    partner: 'eBay + TCGPlayer',
    description: 'Keep your graded slabs organized and protected with dedicated PSA storage cases.',
    ebayUrl: buildEbaySearchUrl({ searchQuery: 'PSA graded card storage case holder', customId: 'deals-psacase' }),
    tcgPlayerUrl: buildTcgPlayerSearchUrl('PSA graded card storage case'),
    category: 'Supplies',
  },
  {
    title: 'Magnetic One-Touch Card Holders',
    partner: 'eBay + TCGPlayer',
    description: 'Premium magnetic holders with UV protection. Perfect for displaying your most valuable cards.',
    ebayUrl: buildEbaySearchUrl({ searchQuery: 'ultra pro one touch magnetic holder 35pt', customId: 'deals-magnetic' }),
    tcgPlayerUrl: buildTcgPlayerSearchUrl('magnetic one touch card holder'),
    badge: 'Premium',
    category: 'Supplies',
  },
];

export default function DealsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Smart Deals</h1>
        </div>
        <p className="text-muted-foreground">
          Live price drops, trending steals, and curated supply deals. Every link supports PokeShows while getting you the best prices.
        </p>
      </div>

      {/* Dynamic Deals Section: Price Drops + Trending Steals */}
      <DynamicDeals />

      {/* Evergreen Supply Deals */}
      <section className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Card Supplies</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Protect your collection with quality supplies. Available on both eBay and TCGPlayer.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {EVERGREEN_DEALS.map((deal) => (
            <div
              key={deal.title}
              className="rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm leading-tight">
                  {deal.title}
                </h3>
                {deal.badge && (
                  <Badge variant="secondary" className="text-[10px] shrink-0 rounded-full">
                    {deal.badge === 'Popular' && <Star className="h-2.5 w-2.5 mr-0.5" />}
                    {deal.badge === 'Essential' && <Zap className="h-2.5 w-2.5 mr-0.5" />}
                    {deal.badge === 'Premium' && <Sparkles className="h-2.5 w-2.5 mr-0.5" />}
                    {deal.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {deal.description}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={deal.ebayUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                >
                  eBay <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={deal.tcgPlayerUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  TCGPlayer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partner CTA */}
      <div className="mt-12 rounded-xl border border-border bg-muted/30 p-6 text-center">
        <h3 className="font-semibold mb-2">Want to list a deal?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          If you run a card shop, grading service, or Pokemon brand and want to share a deal with our community, we&apos;d love to hear from you.
        </p>
        <Link
          href="/sponsors"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:opacity-90 transition-opacity text-sm"
        >
          Partner with Us
        </Link>
      </div>
    </div>
  );
}
