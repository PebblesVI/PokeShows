import { ExternalLink } from 'lucide-react';
import { buildEbaySearchUrl } from '@/lib/ebay';

interface Category {
  slug: string;
  name: string;
  description: string;
  searchQuery: string;
  ebayCategory: string;
}

export function CategoryCard({ category }: { category: Category }) {
  const url = buildEbaySearchUrl({
    searchQuery: category.searchQuery,
    category: category.ebayCategory,
    customId: `shop-${category.slug}`,
  });

  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow">
      <div className="group rounded-xl border border-border p-6 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-200">
            {category.name}
          </h3>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors duration-200" />
        </div>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </div>
    </a>
  );
}
