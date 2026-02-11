import { Skeleton } from '@/components/ui/skeleton';

export default function SetsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-24 mb-6 rounded-xl" />
      <Skeleton className="h-9 w-64 mb-2 rounded-xl" />
      <Skeleton className="h-5 w-96 mb-8 rounded-xl" />
      <Skeleton className="h-12 max-w-xl rounded-full mb-12" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-12">
          <Skeleton className="h-7 w-40 mb-4 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
