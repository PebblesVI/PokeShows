import { Metadata } from 'next';
import { PriceChecker } from '@/components/tools/price-checker';

export const metadata: Metadata = {
  title: 'Price Check — Compare Pokemon Card Prices',
  description: 'Instantly check Pokemon card prices. Compare TCGPlayer market prices with eBay listings before you buy.',
};

export default function PriceCheckPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Price Check</h1>
      <p className="text-muted-foreground mb-10">
        Search for any Pokemon card to compare TCGPlayer market prices and find the best deals on eBay.
      </p>
      <PriceChecker />
    </div>
  );
}
