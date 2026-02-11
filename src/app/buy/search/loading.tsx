import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-64 mb-6 rounded-xl" />
      <Skeleton className="h-12 max-w-xl rounded-full mb-8" />
      <Skeleton className="h-5 w-48 mb-6 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2.5/3.5] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
