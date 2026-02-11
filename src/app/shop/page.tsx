import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CategoryCard } from '@/components/shop/category-card';
import { SHOP_CATEGORIES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Shop Pokemon Cards',
  description: 'Shop for Pokemon cards, booster boxes, graded cards, and accessories on eBay. Find the best deals on sealed products and singles.',
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Shop Pokemon Cards</h1>
          <p className="text-muted-foreground">
            Browse curated Pokemon card categories on eBay. Find sealed products, singles, graded cards, and accessories.
          </p>
        </div>
        <Link
          href="/buy"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
        >
          Browse with live listings <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOP_CATEGORIES.map(category => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </div>
  );
}
