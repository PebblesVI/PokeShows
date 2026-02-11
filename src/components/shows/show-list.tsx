import { ShowCard } from './show-card';
import type { Show } from '@/types/show';

export function ShowList({ shows }: { shows: Show[] }) {
  if (shows.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">No upcoming shows found.</p>
        <p className="text-sm text-muted-foreground mt-1">Check back soon or try different filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </div>
  );
}
