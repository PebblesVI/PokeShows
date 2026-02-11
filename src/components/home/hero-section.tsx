import Link from 'next/link';
import { CardHero } from '@/components/card-of-the-day/card-hero';
import { CardShareButtons } from '@/components/card-of-the-day/card-share-buttons';
import type { CardOfTheDay } from '@/types/card';

export function HeroSection({ card }: { card: CardOfTheDay | null }) {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 sm:px-6 lg:px-8">
        {card ? (
          <div>
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  <span className="text-primary">Poke</span>Shows
                </h1>
                <p className="text-muted-foreground text-lg">
                  Find Pokemon card shows near you
                </p>
              </div>
              <Link
                href="/card-of-the-day"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hidden sm:block"
              >
                View archive &rarr;
              </Link>
            </div>
            <CardHero card={card} />
            <CardShareButtons card={card} />
          </div>
        ) : (
          <div className="text-center py-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-primary">Poke</span>Shows
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The ultimate directory of Pokemon and trading card shows across the United States.
              Find card shows, conventions, and tournaments near you.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
