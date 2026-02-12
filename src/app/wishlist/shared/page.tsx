import { Metadata } from 'next';
import { SharedWishlistContent } from '@/components/wishlist/shared-wishlist-content';

interface SharedWishlistPageProps {
  searchParams: Promise<{ cards?: string }>;
}

export async function generateMetadata({ searchParams }: SharedWishlistPageProps): Promise<Metadata> {
  const { cards } = await searchParams;
  const count = cards ? cards.split(',').length : 0;

  return {
    title: `Shared Card Wishlist — ${count} ${count === 1 ? 'card' : 'cards'}`,
    description: `Check out this Pokemon card wishlist with ${count} ${count === 1 ? 'card' : 'cards'}. Find the best deals on eBay.`,
  };
}

export default async function SharedWishlistPage({ searchParams }: SharedWishlistPageProps) {
  const { cards } = await searchParams;

  if (!cards) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground mb-4">No cards in this wishlist.</p>
          <a
            href="/wishlist"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Create Your Own Wishlist
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Shared Card Wishlist</h1>
      <p className="text-muted-foreground mb-10">
        Someone shared their Pokemon card wishlist with you!
      </p>
      <SharedWishlistContent cardIds={cards} />
    </div>
  );
}
