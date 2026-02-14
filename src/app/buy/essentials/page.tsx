import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Award, ShoppingBag, Gem, Sparkles, ExternalLink } from 'lucide-react';
import { BuySearch } from '@/components/buy/buy-search';
import { buildEbaySearchUrl } from '@/lib/ebay';

export const metadata: Metadata = {
  title: 'Show Day Essentials — Pokemon Card Supplies & Gear',
  description: 'Curated kits of must-have Pokemon card supplies. Grading prep, show day gear, vintage protection, and new collector starter packs.',
};

const BUNDLES = [
  {
    name: 'Grading Day Kit',
    description: 'Everything you need to prep cards for grading submissions.',
    icon: 'Award',
    items: [
      { name: 'Top Loaders (100ct)', query: 'ultra pro top loaders 100', customId: 'essentials-grading-toploaders' },
      { name: 'Penny Sleeves (200ct)', query: 'penny sleeves pokemon cards 200', customId: 'essentials-grading-pennysleeves' },
      { name: 'Card Saver 1 (50ct)', query: 'card saver 1 semi rigid', customId: 'essentials-grading-cardsaver' },
      { name: 'Grading Labels', query: 'PSA BGS submission labels', customId: 'essentials-grading-labels' },
    ],
  },
  {
    name: 'Show Day Pack',
    description: 'Must-haves for a day at the card show.',
    icon: 'ShoppingBag',
    items: [
      { name: 'Penny Sleeves (200ct)', query: 'penny sleeves pokemon cards 200', customId: 'essentials-showday-sleeves' },
      { name: 'Top Loaders (100ct)', query: 'ultra pro top loaders 100', customId: 'essentials-showday-toploaders' },
      { name: 'PSA Slab Storage Case', query: 'PSA graded card storage case', customId: 'essentials-showday-psacase' },
      { name: 'Magnetic One-Touch Holders', query: 'magnetic card holder 35pt one touch', customId: 'essentials-showday-magnetic' },
    ],
  },
  {
    name: 'Vintage Collector Kit',
    description: 'Protect and display your most valuable vintage cards.',
    icon: 'Gem',
    items: [
      { name: 'Magnetic Holders', query: 'magnetic card holder 35pt', customId: 'essentials-vintage-magnetic' },
      { name: 'UV Card Stand', query: 'card display stand UV protection', customId: 'essentials-vintage-uvstand' },
      { name: 'Display Case', query: 'pokemon card display case', customId: 'essentials-vintage-displaycase' },
      { name: 'Humidity Control Pack', query: 'boveda humidity pack cards', customId: 'essentials-vintage-humidity' },
    ],
  },
  {
    name: 'New Collector Starter',
    description: 'The perfect starter set for someone just getting into Pokemon cards.',
    icon: 'Sparkles',
    items: [
      { name: 'Elite Trainer Box', query: 'pokemon elite trainer box latest', customId: 'essentials-starter-etb' },
      { name: 'Card Sleeves (100ct)', query: 'pokemon card sleeves 100', customId: 'essentials-starter-sleeves' },
      { name: 'Top Loaders (25ct)', query: 'ultra pro top loaders 25 pack', customId: 'essentials-starter-toploaders' },
      { name: 'Booster Pack Bundle', query: 'pokemon booster pack bundle', customId: 'essentials-starter-boosters' },
    ],
  },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  ShoppingBag,
  Gem,
  Sparkles,
};

export default function EssentialsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/buy"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Buy
      </Link>

      <div className="mb-8">
        <BuySearch />
      </div>

      <h1 className="text-3xl font-bold mb-2">Show Day Essentials</h1>
      <p className="text-muted-foreground mb-10">
        Curated kits of must-have supplies for every type of Pokemon card collector. Each item links directly to eBay for easy shopping.
      </p>

      <div className="space-y-12">
        {BUNDLES.map((bundle) => {
          const IconComponent = ICON_MAP[bundle.icon] ?? ShoppingBag;

          return (
            <section key={bundle.name}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{bundle.name}</h2>
                  <p className="text-sm text-muted-foreground">{bundle.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {bundle.items.map((item) => {
                  const ebayUrl = buildEbaySearchUrl({
                    searchQuery: item.query,
                    customId: item.customId,
                  });

                  return (
                    <div
                      key={item.customId}
                      className="rounded-xl border border-border p-4 flex flex-col justify-between hover:border-primary/30 transition-all duration-200"
                    >
                      <h3 className="text-sm font-medium mb-3">{item.name}</h3>
                      <a
                        href={ebayUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                      >
                        Shop on eBay
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
