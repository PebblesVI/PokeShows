import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, DollarSign, Globe, User } from 'lucide-react';
import { format } from 'date-fns';
import type { Show } from '@/types/show';

export function ShowDetailHero({ show }: { show: Show }) {
  const startDate = new Date(show.startDate);
  const dateStr = format(startDate, 'EEEE, MMMM d, yyyy');
  const endDateStr = show.endDate ? format(new Date(show.endDate), 'EEEE, MMMM d, yyyy') : null;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold">{show.name}</h1>
        <div className="flex gap-2 shrink-0">
          {show.isPokemonSpecific && <Badge variant="default">Pokemon</Badge>}
          <Badge variant="secondary">{show.eventType?.replace('_', ' ')}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <span>
            {dateStr}
            {endDateStr && endDateStr !== dateStr && ` - ${endDateStr}`}
          </span>
        </div>

        {(show.startTime || show.endTime) && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span>
              {show.startTime}{show.endTime ? ` - ${show.endTime}` : ''}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span>
            {show.venueName ? `${show.venueName}, ` : ''}
            {show.city}, {show.stateFullName || show.state}
          </span>
        </div>

        {show.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 opacity-0" />
            <span className="text-muted-foreground">{show.address}</span>
          </div>
        )}

        {show.admissionPrice && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary shrink-0" />
            <span>Admission: {show.admissionPrice}</span>
          </div>
        )}

        {show.organizerName && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary shrink-0" />
            <span>Organized by {show.organizerName}</span>
          </div>
        )}

        {show.websiteUrl && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <a
              href={show.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Official Website
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
