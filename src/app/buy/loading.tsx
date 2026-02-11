import { Skeleton } from '@/components/ui/skeleton';

export default function BuyLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-64 mb-2 rounded-xl" />
      <Skeleton className="h-5 w-96 mb-12 rounded-xl" />

      <Skeleton className="h-7 w-48 mb-6 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-7 w-56 mb-6 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2.5/3.5] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
