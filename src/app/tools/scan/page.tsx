import { Metadata } from 'next';
import { Smartphone } from 'lucide-react';
import { ShowScanner } from '@/components/tools/show-scanner';

export const metadata: Metadata = {
  title: 'Show Day Price Scanner — Check Pokemon Card Prices at Shows',
  description: 'Mobile-first price scanner for Pokemon card shows. Quick price lookup, running haul tracker, and market comparisons right from your phone.',
};

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Price Scanner</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Quick price checks at the show. Search any card to see market prices, then track your purchases with the haul tracker.
        </p>
      </div>

      <ShowScanner />
    </div>
  );
}
