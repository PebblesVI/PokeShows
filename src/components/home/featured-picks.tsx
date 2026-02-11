import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SHOP_CATEGORIES } from '@/lib/constants';

export function FeaturedPicks() {
  const featured = SHOP_CATEGORIES.slice(0, 3);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featured.map((category) => (
          <Link key={category.slug} href={`/buy/category/${category.slug}`}>
            <div className="group rounded-xl border border-border p-6 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
              <h3 className="font-semibold group-hover:text-primary transition-colors duration-200">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
              <span className="inline-flex items-center gap-1 text-xs text-primary mt-3 font-medium">
                Browse listings <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button variant="outline" asChild>
          <Link href="/buy">
            Browse All Categories
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
