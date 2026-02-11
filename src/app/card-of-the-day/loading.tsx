import { Skeleton } from '@/components/ui/skeleton';

export default function CardOfTheDayLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-10 w-80 mb-8" />

      <div className="flex flex-col md:flex-row gap-8">
        <Skeleton className="h-96 w-72 rounded-xl shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-40 mt-4" />
        </div>
      </div>

      <Skeleton className="h-8 w-48 mt-16 mb-6" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2.5/3.5] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
