import { Skeleton } from '@/components/ui/skeleton';

export default function ShowDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Countdown + bookmark skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-14 rounded" />
          ))}
        </div>
        <Skeleton className="h-9 w-20 rounded" />
      </div>

      {/* Hero skeleton */}
      <Skeleton className="h-64 w-full rounded-xl mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
