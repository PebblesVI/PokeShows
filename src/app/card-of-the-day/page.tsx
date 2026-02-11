export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { CardHero } from '@/components/card-of-the-day/card-hero';
import { CardArchiveList } from '@/components/card-of-the-day/card-archive-list';
import { getCardOfTheDay, getCardArchive } from '@/db/queries/cards';

export async function generateMetadata(): Promise<Metadata> {
  const card = await getCardOfTheDay();
  if (!card) {
    return {
      title: 'Pokemon Card of the Day',
      description: 'Discover a new random Pokemon card every day on PokeShows.',
    };
  }
  return {
    title: `Pokemon Card of the Day: ${card.cardName}`,
    description: `Today's Pokemon Card of the Day is ${card.cardName} from the ${card.setName} set. ${card.rarity ? `${card.rarity} card` : 'Card'} illustrated by ${card.artist || 'unknown artist'}.`,
    openGraph: {
      title: `Pokemon Card of the Day: ${card.cardName} | PokeShows`,
      description: `Today's featured card: ${card.cardName} from ${card.setName}.`,
      images: [{ url: card.imageLarge, width: 734, height: 1024 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Pokemon Card of the Day: ${card.cardName}`,
      images: [card.imageLarge],
    },
  };
}

export default async function CardOfTheDayPage() {
  const [todayCard, archive] = await Promise.all([
    getCardOfTheDay(),
    getCardArchive(30),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-10">Pokemon Card of the Day</h1>

      {todayCard ? (
        <CardHero card={todayCard} />
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">
            No card selected yet today. Check back soon!
          </p>
        </div>
      )}

      {archive.length > 1 && (
        <section className="mt-20 pt-12 border-t border-border">
          <h2 className="text-2xl font-semibold mb-8">Past Cards</h2>
          <CardArchiveList cards={archive.slice(1)} />
        </section>
      )}
    </div>
  );
}
