export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSetById, getCardsBySet } from '@/lib/pokemon-tcg';
import { SetCompletionContent } from '@/components/collection/set-completion-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const set = await getSetById(id);
  if (!set) return { title: 'Set Not Found' };

  return {
    title: `${set.name} — Set Completion Tracker`,
    description: `Track your collection progress for ${set.name} (${set.series}). See which cards you own, what you're missing, and buy missing cards on eBay.`,
    openGraph: {
      title: `${set.name} Set Completion | PokeShows`,
      description: `Track your ${set.name} collection progress and find missing cards.`,
      images: [{ url: set.images.logo }],
    },
  };
}

export default async function SetCompletionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [set, allCards] = await Promise.all([
    getSetById(id),
    getCardsBySet(id, 250),
  ]);

  if (!set) notFound();

  // Serialize the data to pass to the client component
  const serializedCards = allCards.map((card) => ({
    id: card.id,
    name: card.name,
    number: card.number,
    rarity: card.rarity,
    imageSmall: card.images.small,
    setId: set.id,
    setName: set.name,
  }));

  return (
    <SetCompletionContent
      set={{
        id: set.id,
        name: set.name,
        series: set.series,
        total: set.total,
        printedTotal: set.printedTotal,
        logoUrl: set.images.logo,
      }}
      allCards={serializedCards}
    />
  );
}
