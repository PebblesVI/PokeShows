import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryBuyLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-24 mb-6 rounded-xl" />
      <Skeleton className="h-9 w-72 mb-2 rounded-xl" />
      <Skeleton className="h-5 w-96 mb-10 rounded-xl" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}
