import { Metadata } from 'next';
import { NearMeContent } from '@/components/shows/near-me-content';

export const metadata: Metadata = {
  title: 'Pokemon Card Shows Near Me',
  description: 'Find Pokemon and trading card shows near your location. Browse nearby events with distance, dates, and venue details.',
  openGraph: {
    title: 'Pokemon Card Shows Near Me | PokeShows',
    description: 'Find Pokemon and trading card shows near your location.',
  },
};

export default function NearMePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Shows Near Me</h1>
      <p className="text-muted-foreground mb-10">
        Find Pokemon and trading card shows closest to your location.
      </p>
      <NearMeContent />
    </div>
  );
}
