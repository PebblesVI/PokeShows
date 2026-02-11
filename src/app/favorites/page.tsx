import { Metadata } from 'next';
import { FavoritesPageContent } from '@/components/favorites/favorites-page-content';

export const metadata: Metadata = {
  title: 'Your Saved Shows',
  description: 'View your saved Pokemon and trading card shows.',
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Saved Shows</h1>
      <p className="text-muted-foreground mb-10">
        Shows you&apos;ve bookmarked. Saved locally in your browser.
      </p>
      <FavoritesPageContent />
    </div>
  );
}
