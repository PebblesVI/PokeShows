'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We encountered an unexpected error. This has been logged and we&apos;ll look into it.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
