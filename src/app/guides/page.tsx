import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { GUIDES } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Pokemon Card Buying Guides — Investment Tips & Best Cards',
  description: 'Expert Pokemon card buying guides. Find the best cards to invest in, top vintage picks, most valuable modern cards, and budget-friendly recommendations.',
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold">Buying Guides</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Expert guides to help you find the best Pokemon cards for your collection or investment portfolio. Updated regularly with current market prices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GUIDES.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`}>
            <div className="group rounded-xl border border-border p-6 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
              <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
                {guide.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {guide.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Read Guide <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
