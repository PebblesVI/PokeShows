import { Metadata } from 'next';
import { TrendingContent } from '@/components/trending/trending-content';

export const metadata: Metadata = {
  title: 'Trending Pokemon Cards — Price Movers & Hot Cards',
  description: 'See which Pokemon cards are gaining value, dropping in price, and most wishlisted by collectors. Daily price movement data.',
  openGraph: {
    title: 'Trending Pokemon Cards | PokeShows',
    description: 'Daily price movers, biggest gainers, price drops, and most wishlisted Pokemon cards.',
  },
};

export default function TrendingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Trending Pokemon Cards</h1>
      <p className="text-muted-foreground mb-10">
        Daily price movers, hot cards, and collector favorites. Updated every day.
      </p>
      <TrendingContent />
    </div>
  );
}
