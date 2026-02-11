'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ShowDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Unable to load show</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn&apos;t load this show&apos;s details. It may have been removed or there&apos;s a temporary issue.
      </p>
      <div className="flex gap-4 justify-center">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" asChild>
          <Link href="/shows">Browse Shows</Link>
        </Button>
      </div>
    </div>
  );
}
