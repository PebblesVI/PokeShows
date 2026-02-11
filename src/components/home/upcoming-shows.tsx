import Link from 'next/link';
import { ShowCard } from '@/components/shows/show-card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Show } from '@/types/show';

export function UpcomingShows({ shows }: { shows: Show[] }) {
  if (shows.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No upcoming shows found. Check back soon!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button variant="outline" asChild>
          <Link href="/shows">
            View All Shows
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
