export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ListingGrid } from '@/components/buy/listing-grid';
import { getListingsByCategory } from '@/db/queries/listings';
import { SHOP_CATEGORIES } from '@/lib/constants';
import { buildEbaySearchUrl } from '@/lib/ebay';

function getCategoryBySlug(slug: string) {
  return SHOP_CATEGORIES.find(c => c.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: `Buy ${category.name} on eBay`,
    description: `${category.description} Browse the latest eBay listings and find the best deals.`,
    openGraph: {
      title: `Buy ${category.name} on eBay | PokeShows`,
      description: category.description,
    },
  };
}

export default async function CategoryBuyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const listings = await getListingsByCategory(slug);
  const ebaySearchUrl = buildEbaySearchUrl({
    searchQuery: category.searchQuery,
    category: category.ebayCategory,
    customId: `buy-cat-${slug}`,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/buy"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Buy
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
        <a
          href={ebaySearchUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity shrink-0"
        >
          Shop on eBay
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {listings.length > 0 ? (
        <ListingGrid listings={listings} customId={`buy-cat-${slug}`} />
      ) : (
        <div className="text-center py-20 rounded-xl border border-border bg-muted/30">
          <p className="text-lg text-muted-foreground mb-2">
            Live eBay listings will appear here once indexing is configured.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            In the meantime, search directly on eBay.
          </p>
          <a
            href={ebaySearchUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm font-medium hover:border-primary/30 hover:text-primary transition-all duration-200"
          >
            Browse {category.name} on eBay
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Other categories */}
      <section className="mt-20 pt-12 border-t border-border">
        <h2 className="text-xl font-semibold mb-6">Other Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SHOP_CATEGORIES.filter(c => c.slug !== slug).map((cat) => (
            <Link key={cat.slug} href={`/buy/category/${cat.slug}`}>
              <div className="group rounded-xl border border-border p-4 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                <h3 className="text-sm font-semibold group-hover:text-primary transition-colors duration-200">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
