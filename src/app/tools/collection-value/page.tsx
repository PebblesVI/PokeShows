import { Metadata } from 'next';
import { CollectionCalculator } from '@/components/tools/collection-calculator';

export const metadata: Metadata = {
  title: 'Collection Value Calculator — Estimate Your Pokemon Card Collection Worth',
  description: 'Estimate the value of your Pokemon card collection. Add cards, track totals, and get insights into your collection worth.',
};

export default function CollectionValuePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Collection Value Calculator</h1>
      <p className="text-muted-foreground mb-10">
        Add your Pokemon cards to estimate the total value of your collection. Enter each card and its estimated market value.
      </p>
      <CollectionCalculator />
    </div>
  );
}
