import { Metadata } from 'next';
import { WishlistPageContent } from '@/components/wishlist/wishlist-page-content';

export const metadata: Metadata = {
  title: 'My Card Wishlist',
  description: 'Build a wishlist of Pokemon cards you\'re looking for. Share it with friends and find the best deals on eBay.',
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">My Card Wishlist</h1>
      <p className="text-muted-foreground mb-10">
        Cards you&apos;re looking for. Saved locally in your browser.
      </p>
      <WishlistPageContent />
    </div>
  );
}
