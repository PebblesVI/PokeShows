export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PriceChart } from '@/components/card-of-the-day/price-chart';
import { getCardById, getCardsBySet, type PokemonTcgCard } from '@/lib/pokemon-tcg';
import { buildEbaySearchUrl } from '@/lib/ebay';

function getMarketPrice(card: { tcgplayer?: { prices?: Record<string, { market?: number }> } }): number | null {
  if (!card.tcgplayer?.prices) return null;
  const variants = ['holofoil', 'reverseHolofoil', 'normal', '1stEditionHolofoil'];
  for (const v of variants) {
    const price = card.tcgplayer.prices[v]?.market;
    if (price != null) return price;
  }
  const firstKey = Object.keys(card.tcgplayer.prices)[0];
  return firstKey ? card.tcgplayer.prices[firstKey]?.market ?? null : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const card = await getCardById(id);
    if (!card) return { title: 'Card Not Found' };

    const title = `Buy ${card.name} (${card.set.name}) — Price, Info & Where to Buy`;
    const description = `${card.name} from ${card.set.name}${card.rarity ? ` (${card.rarity})` : ''}. View pricing, card details, and find the best deals on eBay and TCGPlayer.`;

    return {
      title,
      description,
      openGraph: {
        title: `${title} | PokeShows`,
        description,
        images: [{ url: card.images.large, width: 734, height: 1024 }],
      },
    };
  } catch {
    return { title: 'Card Not Found' };
  }
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let card;
  try {
    card = await getCardById(id);
  } catch {
    notFound();
  }

  if (!card) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  const ebaySearchUrl = buildEbaySearchUrl({
    searchQuery: `pokemon card ${card.name} ${card.set.name}`,
    customId: `card-${id}`,
  });

  // Fetch related cards from the same set
  let relatedCards: PokemonTcgCard[] = [];
  try {
    const setCards = await getCardsBySet(card.set.id, 7);
    relatedCards = setCards.filter((c) => c.id !== card.id).slice(0, 6);
  } catch {
    relatedCards = [];
  }

  // Get all pricing variants
  const priceVariants = card.tcgplayer?.prices
    ? Object.entries(card.tcgplayer.prices).map(([variant, prices]) => ({
        variant,
        label: variant
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (s) => s.toUpperCase())
          .replace(/1st/, '1st'),
        ...prices,
      }))
    : [];

  // Compute low/high across all variants for AggregateOffer
  let lowestPrice: number | undefined;
  let highestPrice: number | undefined;
  for (const v of priceVariants) {
    if (v.low != null && (lowestPrice == null || v.low < lowestPrice)) lowestPrice = v.low;
    if (v.high != null && (highestPrice == null || v.high > highestPrice)) highestPrice = v.high;
    if (v.market != null) {
      if (lowestPrice == null || v.market < lowestPrice) lowestPrice = v.market;
      if (highestPrice == null || v.market > highestPrice) highestPrice = v.market;
    }
  }

  // JSON-LD Product markup
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${card.name} - ${card.set.name} Pokemon Card`,
    image: card.images.large,
    description: `${card.name} Pokemon card from the ${card.set.name} set.${card.rarity ? ` ${card.rarity} rarity.` : ''}${card.artist ? ` Illustrated by ${card.artist}.` : ''}`,
    brand: { '@type': 'Brand', name: 'Pokemon' },
    category: 'Trading Cards',
    url: `${siteUrl}/cards/${id}`,
    ...(lowestPrice != null
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: lowestPrice,
            highPrice: highestPrice ?? lowestPrice,
            offerCount: 1,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/buy"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Buy
        </Link>

        <div className="flex flex-col md:flex-row gap-10 items-start mb-12">
          {/* Card image */}
          <div className="w-full md:w-80 shrink-0">
            <Image
              src={card.images.large}
              alt={`${card.name} Pokemon card`}
              width={734}
              height={1024}
              className="rounded-xl shadow-lg w-full"
              priority
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">{card.name}</h1>
            <p className="text-muted-foreground mb-4">
              {card.set.name} &mdash; {card.set.series}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {card.rarity && <Badge variant="secondary">{card.rarity}</Badge>}
              {card.types?.map((type) => (
                <Badge key={type} variant="outline">{type}</Badge>
              ))}
              {card.hp && <Badge variant="outline">{card.hp} HP</Badge>}
            </div>

            {/* Card details */}
            <div className="rounded-xl border border-border p-5 mb-6">
              <h3 className="text-sm font-semibold mb-3">Card Details</h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Set</dt>
                  <dd className="font-medium">{card.set.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Series</dt>
                  <dd className="font-medium">{card.set.series}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Number</dt>
                  <dd className="font-medium">#{card.number}</dd>
                </div>
                {card.rarity && (
                  <div>
                    <dt className="text-muted-foreground">Rarity</dt>
                    <dd className="font-medium">{card.rarity}</dd>
                  </div>
                )}
                {card.artist && (
                  <div>
                    <dt className="text-muted-foreground">Artist</dt>
                    <dd className="font-medium">{card.artist}</dd>
                  </div>
                )}
                {card.hp && (
                  <div>
                    <dt className="text-muted-foreground">HP</dt>
                    <dd className="font-medium">{card.hp}</dd>
                  </div>
                )}
                {card.types && card.types.length > 0 && (
                  <div>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium">{card.types.join(', ')}</dd>
                  </div>
                )}
              </dl>
              {card.flavorText && (
                <p className="mt-4 text-sm italic text-muted-foreground border-t border-border pt-3">
                  &ldquo;{card.flavorText}&rdquo;
                </p>
              )}
            </div>

            {/* Pricing section */}
            {priceVariants.length > 0 && (
              <div className="rounded-xl border border-border bg-muted/50 p-5 mb-6">
                <h3 className="text-sm font-semibold mb-4">TCGPlayer Prices</h3>
                <div className="space-y-4">
                  {priceVariants.map((v) => (
                    <div key={v.variant}>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        {v.label}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {v.low != null && (
                          <div>
                            <p className="text-xs text-muted-foreground">Low</p>
                            <p className="text-lg font-semibold">${v.low.toFixed(2)}</p>
                          </div>
                        )}
                        {v.mid != null && (
                          <div>
                            <p className="text-xs text-muted-foreground">Mid</p>
                            <p className="text-lg font-semibold">${v.mid.toFixed(2)}</p>
                          </div>
                        )}
                        {v.high != null && (
                          <div>
                            <p className="text-xs text-muted-foreground">High</p>
                            <p className="text-lg font-semibold">${v.high.toFixed(2)}</p>
                          </div>
                        )}
                        {v.market != null && (
                          <div>
                            <p className="text-xs text-muted-foreground">Market</p>
                            <p className="text-lg font-semibold text-primary">${v.market.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buy buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href={ebaySearchUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Buy on eBay
                <ExternalLink className="h-4 w-4" />
              </a>
              {card.tcgplayer?.url && (
                <a
                  href={card.tcgplayer.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full font-semibold hover:border-primary/30 hover:text-primary transition-all duration-200"
                >
                  View on TCGPlayer
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Price History */}
        <section className="mb-12">
          <PriceChart pokemonTcgId={id} />
        </section>

        {/* Related cards from this set */}
        {relatedCards.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border">
            <h2 className="text-xl font-semibold mb-6">Related Cards from {card.set.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedCards.map((rc) => {
                const price = getMarketPrice(rc);
                return (
                  <Link key={rc.id} href={`/cards/${rc.id}`}>
                    <div className="group rounded-xl border border-border p-3 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                      <div className="relative aspect-[2.5/3.5] mb-2 overflow-hidden rounded-lg">
                        <Image
                          src={rc.images.small}
                          alt={`${rc.name} #${rc.number}`}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        />
                      </div>
                      <h3 className="text-xs font-semibold truncate group-hover:text-primary transition-colors duration-200">
                        {rc.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">#{rc.number}</p>
                      <div className="flex items-center justify-between mt-1">
                        {rc.rarity && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                            {rc.rarity}
                          </Badge>
                        )}
                        {price != null && (
                          <span className="text-xs font-medium text-primary">
                            ${price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
