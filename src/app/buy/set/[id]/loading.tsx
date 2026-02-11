import { Skeleton } from '@/components/ui/skeleton';

export default function SetDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-20 mb-6 rounded-xl" />
      <div className="flex items-center gap-6 mb-10">
        <Skeleton className="h-16 w-40 rounded-xl" />
        <div>
          <Skeleton className="h-9 w-64 mb-2 rounded-xl" />
          <Skeleton className="h-4 w-48 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2.5/3.5] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
