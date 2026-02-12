export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { getAllSets } from '@/lib/pokemon-tcg';
import { BuySearch } from '@/components/buy/buy-search';

export const metadata: Metadata = {
  title: 'Browse Pokemon Card Sets — Buy Cards by Set',
  description: 'Browse every Pokemon TCG set. Find and buy cards from Scarlet & Violet, Sword & Shield, Sun & Moon, and all classic sets.',
  openGraph: {
    title: 'Browse Pokemon Card Sets | PokeShows',
    description: 'Browse every Pokemon TCG set and buy cards on eBay.',
  },
};

export default async function SetsIndexPage() {
  const sets = await getAllSets();

  // Group sets by series
  const bySeries: Record<string, typeof sets> = {};
  for (const set of sets) {
    const series = set.series || 'Other';
    if (!bySeries[series]) bySeries[series] = [];
    bySeries[series].push(set);
  }

  const seriesOrder = Object.keys(bySeries);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/buy"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Buy
      </Link>

      <h1 className="text-3xl font-bold mb-2">Pokemon Card Sets</h1>
      <p className="text-muted-foreground mb-8">
        Browse every Pokemon TCG set ever released. Click any set to see its cards and buy on eBay.
      </p>

      <div className="mb-12">
        <BuySearch />
      </div>

      {seriesOrder.map((series) => (
        <section key={series} className="mb-12">
          <h2 className="text-xl font-semibold mb-4">{series}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {bySeries[series].map((set) => (
              <Link key={set.id} href={`/buy/set/${set.id}`}>
                <div className="group rounded-xl border border-border p-4 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm text-center">
                  <div className="relative h-12 mb-3">
                    <Image
                      src={set.images.logo}
                      alt={set.name}
                      fill
                      className="object-contain"
                      sizes="120px"
                    />
                  </div>
                  <h3 className="text-xs font-semibold truncate group-hover:text-primary transition-colors duration-200">
                    {set.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {set.printedTotal} cards &middot; {set.releaseDate?.slice(0, 4)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
