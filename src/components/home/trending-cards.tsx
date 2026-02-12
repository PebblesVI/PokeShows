import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cardToSlug } from '@/lib/card-slug';
import { AddToWishlistButton } from '@/components/wishlist/add-to-wishlist-button';

interface TrendingCard {
  id: number;
  pokemonTcgId: string;
  cardName: string;
  setName: string;
  rarity: string | null;
  imageSmall: string;
  imageLarge: string;
  tcgPlayerPrice: number | null;
  featuredDate: string;
}

export function TrendingCards({ cards }: { cards: TrendingCard[] }) {
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const slug = cardToSlug(card.cardName, card.setName);

        return (
          <div key={card.id} className="group relative rounded-xl border border-border p-3 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
              <div className="absolute top-2 right-2 z-10">
                <AddToWishlistButton
                  cardId={card.pokemonTcgId}
                  name={card.cardName}
                  setName={card.setName}
                  imageSmall={card.imageSmall}
                  rarity={card.rarity}
                />
              </div>
              <Link href={`/buy/${slug}`}>
                <div className="relative aspect-[2.5/3.5] mb-2 overflow-hidden rounded-lg">
                  <Image
                    src={card.imageSmall}
                    alt={card.cardName}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                </div>
                <h3 className="text-xs font-semibold truncate">{card.cardName}</h3>
                <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
                <div className="flex items-center justify-between mt-1">
                  {card.rarity && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                      {card.rarity}
                    </Badge>
                  )}
                  {card.tcgPlayerPrice != null && (
                    <span className="text-xs font-medium text-primary">
                      ${card.tcgPlayerPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </Link>
            </div>
        );
      })}
    </div>
  );
}
