import { Metadata } from 'next';
import { FavoritesPageContent } from '@/components/favorites/favorites-page-content';

export const metadata: Metadata = {
  title: 'My Show Planner',
  description: 'Plan your upcoming card show visits. Saved locally in your browser.',
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">My Show Planner</h1>
      <p className="text-muted-foreground mb-10">
        Plan your upcoming card show visits. Saved locally in your browser.
      </p>
      <FavoritesPageContent />
    </div>
  );
}
