import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import type { Show } from '@/types/show';

export function ShowCalendarView({ shows }: { shows: Show[] }) {
  if (shows.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">No upcoming shows found.</p>
      </div>
    );
  }

  const firstShowDate = new Date(shows[0].startDate);
  const monthStart = startOfMonth(firstShowDate);
  const monthEnd = endOfMonth(firstShowDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const showsByDate = new Map<string, Show[]>();
  for (const show of shows) {
    const key = show.startDate;
    if (!showsByDate.has(key)) showsByDate.set(key, []);
    showsByDate.get(key)!.push(show);
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{format(firstShowDate, 'MMMM yyyy')}</h3>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayShows = showsByDate.get(dateKey) || [];
          const hasShows = dayShows.length > 0;

          return (
            <div
              key={dateKey}
              className={`min-h-[80px] p-1 rounded-md border text-xs ${
                hasShows ? 'border-primary/50 bg-primary/5' : 'border-border'
              }`}
            >
              <span className={`text-xs ${hasShows ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {format(day, 'd')}
              </span>
              {dayShows.slice(0, 2).map(show => (
                <Link
                  key={show.id}
                  href={`/shows/${show.slug}`}
                  className="block truncate text-[10px] mt-0.5 text-foreground hover:text-primary"
                >
                  {show.name}
                </Link>
              ))}
              {dayShows.length > 2 && (
                <span className="text-[10px] text-muted-foreground">+{dayShows.length - 2} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
