import { Skeleton } from '@/components/ui/skeleton';

export default function CardBuyLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-24 mb-6 rounded-xl" />

      <div className="flex flex-col md:flex-row gap-10 items-start mb-12">
        <Skeleton className="w-full md:w-64 aspect-[2.5/3.5] rounded-xl shrink-0" />
        <div className="flex-1 w-full">
          <Skeleton className="h-4 w-24 mb-2 rounded-xl" />
          <Skeleton className="h-9 w-72 mb-2 rounded-xl" />
          <Skeleton className="h-5 w-48 mb-6 rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl mb-6" />
          <Skeleton className="h-12 w-44 rounded-full" />
        </div>
      </div>

      <Skeleton className="h-7 w-40 mb-6 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}
