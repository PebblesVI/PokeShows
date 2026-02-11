import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { cardToSlug } from '@/lib/card-slug';
import type { CardOfTheDay } from '@/types/card';

export function CardArchiveList({ cards }: { cards: CardOfTheDay[] }) {
  if (cards.length === 0) {
    return <p className="text-muted-foreground">No past cards yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {cards.map((card) => (
        <Link key={card.id} href={`/buy/${cardToSlug(card.cardName, card.setName)}`}>
          <div className="group">
            <div className="overflow-hidden rounded-xl">
              <Image
                src={card.imageSmall}
                alt={`${card.cardName} from ${card.setName}`}
                width={245}
                height={342}
                className="rounded-xl group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="mt-3 space-y-0.5">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors duration-200">{card.cardName}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(card.featuredDate), 'MMM d, yyyy')}
              </p>
              {card.tcgPlayerPrice != null && (
                <p className="text-xs font-medium text-primary">
                  ${card.tcgPlayerPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
