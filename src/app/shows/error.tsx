'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ShowsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Unable to load shows</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn&apos;t load the show listings right now. Please try again in a moment.
      </p>
      <div className="flex gap-4 justify-center">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
