import Link from 'next/link';
import { MapPin, Calendar } from 'lucide-react';
import { nextSaturday, isSaturday, isSunday, addDays, format } from 'date-fns';

export function HeroSection({ showCount }: { showCount: number }) {
  const now = new Date();
  let sat: Date;
  if (isSaturday(now)) sat = now;
  else if (isSunday(now)) sat = nextSaturday(now);
  else sat = nextSaturday(now);
  const sun = addDays(sat, 1);
  const weekendUrl = `/shows?from=${format(sat, 'yyyy-MM-dd')}&to=${format(sun, 'yyyy-MM-dd')}`;

  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          Find <span className="text-primary">Pokemon Card Shows</span> Near You
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
          The largest directory of Pokemon and trading card shows across the United States.
          {showCount > 0 && (
            <> Browse <span className="font-semibold text-foreground">{showCount}+</span> upcoming events.</>
          )}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/shows"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            <MapPin className="h-4 w-4" />
            Browse All Shows
          </Link>
          <Link
            href={weekendUrl}
            className="inline-flex items-center gap-2 px-8 py-3 border border-border rounded-full font-medium hover:border-primary/30 hover:text-primary transition-all duration-200"
          >
            <Calendar className="h-4 w-4" />
            This Weekend
          </Link>
        </div>
      </div>
    </section>
  );
}
