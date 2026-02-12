import { Metadata } from 'next';
import { CompareContent } from '@/components/shows/compare-content';

export const metadata: Metadata = {
  title: 'Compare Shows',
  description: 'Compare Pokemon card shows side by side. Compare dates, locations, admission prices, and more.',
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Compare Shows</h1>
      <p className="text-muted-foreground mb-10">
        Compare up to 3 shows side by side to find the best one for you.
      </p>
      <CompareContent />
    </div>
  );
}
