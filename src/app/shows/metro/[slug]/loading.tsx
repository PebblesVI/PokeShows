import { Skeleton } from '@/components/ui/skeleton';

export default function MetroShowsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Summary paragraph skeleton */}
      <Skeleton className="h-4 w-full max-w-2xl mb-6" />

      {/* Hero section skeleton */}
      <Skeleton className="h-10 w-96 mb-2" />
      <Skeleton className="h-6 w-72 mb-4" />
      <Skeleton className="h-5 w-full max-w-3xl mb-12" />

      {/* Show cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>

      {/* Cities section skeleton */}
      <div className="mt-20 pt-12 border-t border-border">
        <Skeleton className="h-7 w-64 mb-6" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
