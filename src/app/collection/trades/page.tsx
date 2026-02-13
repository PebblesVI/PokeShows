import { Metadata } from 'next';
import { TradeBinder } from '@/components/collection/trade-binder';

export const metadata: Metadata = {
  title: 'Trade Binder - Find Cards to Trade | PokeShows',
  description:
    'Browse Pokemon cards available for trade from collectors in the PokeShows community. Offer your cards and find new additions for your collection.',
  openGraph: {
    title: 'Trade Binder - Find Cards to Trade | PokeShows',
    description:
      'Browse Pokemon cards available for trade from collectors in the PokeShows community.',
    url: '/collection/trades',
  },
};

export default function TradesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <TradeBinder />
    </div>
  );
}
