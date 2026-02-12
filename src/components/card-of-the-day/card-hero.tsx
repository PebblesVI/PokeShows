import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { cardToSlug } from '@/lib/card-slug';
import { PriceChart } from '@/components/card-of-the-day/price-chart';
import { AddToWishlistButton } from '@/components/wishlist/add-to-wishlist-button';
import type { CardOfTheDay } from '@/types/card';

function formatVariant(variant: string): string {
  return variant
    .replace(/([A-Z])/g, ' $1')
    .replace(/1st/, '1st')
    .trim()
    .replace(/^./, c => c.toUpperCase());
}

export function CardHero({ card }: { card: CardOfTheDay }) {
  const types = card.types ? (JSON.parse(card.types) as string[]) : [];
  const ebayUrl = buildEbaySearchUrl({
    searchQuery: `pokemon ${card.cardName} ${card.setName}`,
    customId: 'cotd',
  });

  const hasAnyPrice = card.tcgPlayerPrice != null || card.priceLow != null || card.priceHigh != null;

  return (
    <div className="flex flex-col md:flex-row gap-10 items-start">
      <div className="w-full md:w-1/3 max-w-sm mx-auto md:mx-0">
        <Image
          src={card.imageLarge}
          alt={`${card.cardName} Pokemon card from ${card.setName}`}
          width={734}
          height={1024}
          className="rounded-xl shadow-lg"
          priority
        />
      </div>

      <div className="flex-1">
        <p className="text-sm text-primary font-medium mb-1 tracking-wide uppercase">Card of the Day</p>
        <h2 className="text-3xl font-bold mb-6 tracking-tight">{card.cardName}</h2>

        <div className="space-y-2 mb-6 text-sm">
          <p><span className="text-muted-foreground">Set:</span> {card.setName}{card.setSeries ? ` (${card.setSeries})` : ''}</p>
          <p><span className="text-muted-foreground">Number:</span> #{card.cardNumber}</p>
          {card.rarity && <p><span className="text-muted-foreground">Rarity:</span> {card.rarity}</p>}
          {card.artist && <p><span className="text-muted-foreground">Artist:</span> {card.artist}</p>}
          {card.hp && <p><span className="text-muted-foreground">HP:</span> {card.hp}</p>}

          {types.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Type:</span>
              {types.map(type => (
                <Badge key={type} variant="secondary">{type}</Badge>
              ))}
            </div>
          )}

          {card.flavorText && (
            <p className="italic text-muted-foreground mt-4">&quot;{card.flavorText}&quot;</p>
          )}
        </div>

        {/* Pricing Section */}
        {hasAnyPrice && (
          <div className="rounded-xl border border-border bg-muted/50 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold">TCGPlayer Pricing</h3>
              {card.priceVariant && (
                <Badge variant="outline" className="text-xs">
                  {formatVariant(card.priceVariant)}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {card.priceLow != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Low</p>
                  <p className="text-lg font-semibold">${card.priceLow.toFixed(2)}</p>
                </div>
              )}
              {card.tcgPlayerPrice != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Market</p>
                  <p className="text-lg font-semibold text-primary">${card.tcgPlayerPrice.toFixed(2)}</p>
                </div>
              )}
              {card.priceMid != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Mid</p>
                  <p className="text-lg font-semibold">${card.priceMid.toFixed(2)}</p>
                </div>
              )}
              {card.priceHigh != null && (
                <div>
                  <p className="text-xs text-muted-foreground">High</p>
                  <p className="text-lg font-semibold">${card.priceHigh.toFixed(2)}</p>
                </div>
              )}
            </div>
            {card.tcgPlayerUrl && (
              <a
                href={card.tcgPlayerUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
              >
                View on TCGPlayer <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <PriceChart pokemonTcgId={card.pokemonTcgId} />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <a
            href={ebayUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Buy on eBay
            <ExternalLink className="h-4 w-4" />
          </a>
          <Link
            href={`/buy/${cardToSlug(card.cardName, card.setName)}`}
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full font-medium hover:border-primary/30 hover:text-primary transition-all duration-200"
          >
            <ShoppingBag className="h-4 w-4" />
            Compare Prices
          </Link>
          <AddToWishlistButton
            cardId={card.pokemonTcgId}
            name={card.cardName}
            setName={card.setName}
            imageSmall={card.imageSmall}
            rarity={card.rarity}
            size="default"
          />
        </div>
      </div>
    </div>
  );
}
