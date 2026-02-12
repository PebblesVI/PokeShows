import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { Show } from '@/types/show';
import { BookmarkButton } from '@/components/favorites/bookmark-button';
import { CompareButton } from '@/components/shows/compare-button';

export function ShowCard({ show }: { show: Show }) {
  const startDate = new Date(show.startDate);
  const dateStr = format(startDate, 'MMM d, yyyy');
  const endDateStr = show.endDate ? ` - ${format(new Date(show.endDate), 'MMM d')}` : '';

  return (
    <Link href={`/shows/${show.slug}`}>
      <div className="group rounded-xl border border-border p-5 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold leading-tight">{show.name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            {show.isPokemonSpecific && (
              <Badge variant="default" className="rounded-full text-xs">Pokemon</Badge>
            )}
            <CompareButton slug={show.slug} />
            <BookmarkButton slug={show.slug} />
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{dateStr}{endDateStr}</span>
            {show.startTime && <span className="text-xs">at {show.startTime}</span>}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{show.city}, {show.state}</span>
          </div>

          {show.venueName && (
            <p className="text-xs truncate">{show.venueName}</p>
          )}

          {show.admissionPrice && (
            show.admissionPrice.toLowerCase() === 'free' || show.admissionPrice === '$0' ? (
              <span className="inline-flex items-center text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                Free Admission
              </span>
            ) : (
              <p className="text-xs font-medium">
                Admission: <span className="text-foreground">{show.admissionPrice}</span>
              </p>
            )
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Badge variant="secondary" className="text-xs rounded-full">{show.eventType?.replace('_', ' ')}</Badge>
        </div>
      </div>
    </Link>
  );
}
