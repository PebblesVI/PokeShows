import { Metadata } from 'next';
import { BingoCard } from '@/components/bingo/bingo-card';

export const metadata: Metadata = {
  title: 'Collection Bingo',
  description: 'Monthly Pokemon collecting challenge. Complete goals to fill your bingo card and share your progress.',
};

export default function BingoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Collection Bingo</h1>
      <p className="text-muted-foreground mb-10">
        Complete collecting goals each month. Get 5 in a row for BINGO! Progress is saved in your browser.
      </p>
      <BingoCard />
    </div>
  );
}
