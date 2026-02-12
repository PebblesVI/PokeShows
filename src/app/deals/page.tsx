import { Metadata } from 'next';
import { ExternalLink, Tag, Star, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buildEbaySearchUrl } from '@/lib/ebay';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Partner Deals — Pokemon Card Discounts & Offers',
  description: 'Exclusive deals from our partners on Pokemon cards, supplies, grading services, and more. Curated offers for the PokeShows community.',
};

// Each deal is a partner referral link. Add new deals here as partnerships are established.
const DEALS: {
  title: string;
  partner: string;
  description: string;
  url: string;
  badge?: string;
  category: string;
}[] = [
  {
    title: '10% Off Card Sleeves & Top Loaders',
    partner: 'eBay',
    description: 'Stock up on penny sleeves, top loaders, and magnetic holders. Great prices on bulk card protection supplies.',
    url: buildEbaySearchUrl({ searchQuery: 'pokemon card sleeves top loaders bulk', customId: 'deals-supplies' }),
    badge: 'Popular',
    category: 'Supplies',
  },
  {
    title: 'PSA Graded Cards Under $50',
    partner: 'eBay',
    description: 'Find affordable PSA graded Pokemon cards. Build your graded collection without breaking the bank.',
    url: buildEbaySearchUrl({ searchQuery: 'PSA graded pokemon card', customId: 'deals-graded' }),
    category: 'Graded Cards',
  },
  {
    title: 'Sealed Booster Boxes at Market Price',
    partner: 'eBay',
    description: 'Latest Pokemon TCG booster boxes from trusted sellers. Perfect for ripping at your next show.',
    url: buildEbaySearchUrl({ searchQuery: 'pokemon booster box sealed latest', customId: 'deals-sealed' }),
    badge: 'Hot',
    category: 'Sealed Product',
  },
  {
    title: 'PSA Slab Storage Cases',
    partner: 'eBay',
    description: 'Protect your graded cards with dedicated PSA slab cases. Multiple sizes available for any collection.',
    url: buildEbaySearchUrl({ searchQuery: 'PSA graded card storage case holder', customId: 'deals-psacase' }),
    category: 'Supplies',
  },
  {
    title: 'Japanese Pokemon Cards',
    partner: 'eBay',
    description: 'Explore Japanese Pokemon cards with exclusive art and sets not available in English. Great collectibles and investment pieces.',
    url: buildEbaySearchUrl({ searchQuery: 'pokemon card japanese booster', customId: 'deals-japanese' }),
    category: 'Cards',
  },
  {
    title: 'Elite Trainer Boxes',
    partner: 'eBay',
    description: 'The best value in Pokemon TCG — ETBs come with packs, sleeves, dice, and a storage box all in one.',
    url: buildEbaySearchUrl({ searchQuery: 'pokemon elite trainer box sealed', customId: 'deals-etb' }),
    category: 'Sealed Product',
  },
  {
    title: 'Magnetic One-Touch Card Holders',
    partner: 'eBay',
    description: 'Premium magnetic holders for your most valuable cards. UV protection and crystal-clear display.',
    url: buildEbaySearchUrl({ searchQuery: 'ultra pro one touch magnetic holder 35pt', customId: 'deals-magnetic' }),
    category: 'Supplies',
  },
  {
    title: 'Vintage Base Set Cards',
    partner: 'eBay',
    description: 'Original Base Set Pokemon cards — Charizard, Blastoise, Venusaur, and more from where it all started.',
    url: buildEbaySearchUrl({ searchQuery: 'pokemon base set card original', customId: 'deals-vintage' }),
    badge: 'Classic',
    category: 'Cards',
  },
];

const CATEGORIES = [...new Set(DEALS.map(d => d.category))];

export default function DealsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Partner Deals</h1>
        </div>
        <p className="text-muted-foreground">
          Curated deals and offers from our partners. Every link supports PokeShows while getting you great prices on cards, supplies, and more.
        </p>
      </div>

      {/* Category Nav */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <span
            key={cat}
            className="px-3 py-1 text-xs font-medium rounded-full border border-border bg-muted/30"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Deals Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {DEALS.map((deal) => (
          <a
            key={deal.title}
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="group rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="font-semibold text-sm group-hover:text-primary transition-colors leading-tight">
                {deal.title}
              </h2>
              {deal.badge && (
                <Badge variant="secondary" className="text-[10px] shrink-0 rounded-full">
                  {deal.badge === 'Hot' && <Sparkles className="h-2.5 w-2.5 mr-0.5" />}
                  {deal.badge === 'Popular' && <Star className="h-2.5 w-2.5 mr-0.5" />}
                  {deal.badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {deal.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">via {deal.partner}</span>
              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                Shop Now <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </a>
        ))}
      </div>

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
