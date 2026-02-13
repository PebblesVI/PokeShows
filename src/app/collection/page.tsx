export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { CollectionPageContent } from '@/components/collection/collection-page-content';

export const metadata: Metadata = {
  title: 'My Collection — Track Your Pokemon Cards',
  description:
    'Track your Pokemon card collection, see set completion progress, estimate your collection value, and find missing cards to buy on eBay.',
  openGraph: {
    title: 'My Collection — Track Your Pokemon Cards | PokeShows',
    description:
      'Track your Pokemon card collection and complete your sets.',
  },
};

export default function CollectionPage() {
  return <CollectionPageContent />;
}
