export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ListingGrid } from '@/components/buy/listing-grid';
import { getListingsByCardSlug } from '@/db/queries/listings';
import { slugToSearchQuery, cardToSlug } from '@/lib/card-slug';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { buildTcgPlayerAffiliateUrl } from '@/lib/tcgplayer-affiliate';
import { db } from '@/db';
import { cardOfTheDay } from '@/db/schema';
import { sql, ne, desc } from 'drizzle-orm';

async function findCardBySlug(slug: string) {
  const searchTerms = slugToSearchQuery(slug);
  const pattern = `%${searchTerms.split(' ').slice(0, 2).join('%')}%`;

  const results = await db.select()
    .from(cardOfTheDay)
    .where(sql`lower(${cardOfTheDay.cardName} || ' ' || ${cardOfTheDay.setName}) LIKE lower(${pattern})`)
    .limit(1);

  return results[0] ?? null;
}

async function getRelatedCards(excludeId: number, limit = 6) {
  return db.select({
    id: cardOfTheDay.id,
    cardName: cardOfTheDay.cardName,
    setName: cardOfTheDay.setName,
    imageSmall: cardOfTheDay.imageSmall,
    tcgPlayerPrice: cardOfTheDay.tcgPlayerPrice,
    rarity: cardOfTheDay.rarity,
  })
    .from(cardOfTheDay)
    .where(ne(cardOfTheDay.id, excludeId))
    .orderBy(desc(cardOfTheDay.featuredDate))
    .limit(limit);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = await findCardBySlug(slug);
  const displayName = card?.cardName ?? slugToSearchQuery(slug).replace(/\b\w/g, c => c.toUpperCase());
  const setName = card?.setName ?? '';

  const title = `Buy ${displayName}${setName ? ` — ${setName}` : ''} on eBay`;
  const description = `Find ${displayName} Pokemon cards for sale on eBay. Compare prices and buy from trusted sellers.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | PokeShows`,
      description,
      ...(card?.imageLarge ? { images: [{ url: card.imageLarge, width: 734, height: 1024 }] } : {}),
    },
  };
}

export default async function CardBuyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = await findCardBySlug(slug);
  const listings = await getListingsByCardSlug(slug);
  const relatedCards = card ? await getRelatedCards(card.id) : [];
  const displayName = card?.cardName ?? slugToSearchQuery(slug).replace(/\b\w/g, c => c.toUpperCase());
  const searchQuery = `pokemon card ${card ? `${card.cardName} ${card.setName}` : slugToSearchQuery(slug)}`;
  const ebaySearchUrl = buildEbaySearchUrl({ searchQuery, customId: `buy-card-${slug}` });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';

  // JSON-LD Product markup
  const jsonLd = card ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${card.cardName} - ${card.setName} Pokemon Card`,
    image: card.imageLarge,
    description: `${card.cardName} Pokemon card from the ${card.setName} set.${card.rarity ? ` ${card.rarity} rarity.` : ''}${card.artist ? ` Illustrated by ${card.artist}.` : ''}`,
    brand: { '@type': 'Brand', name: 'Pokemon' },
    category: 'Trading Cards',
    url: `${siteUrl}/buy/${slug}`,
    ...(card.tcgPlayerPrice != null ? {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: card.priceLow ?? card.tcgPlayerPrice,
        highPrice: card.priceHigh ?? card.tcgPlayerPrice,
        offerCount: listings.length || 1,
        availability: 'https://schema.org/InStock',
      },
    } : {}),
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/buy"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Buy
        </Link>

        <div className="flex flex-col md:flex-row gap-10 items-start mb-12">
          {/* Card preview */}
          {card && (
            <div className="w-full md:w-64 shrink-0">
              <Image
                src={card.imageLarge}
                alt={`${card.cardName} Pokemon card`}
                width={734}
                height={1024}
                className="rounded-xl shadow-lg w-full"
                priority
              />
            </div>
          )}

          <div className="flex-1">
            <p className="text-sm text-primary font-medium mb-1 tracking-wide uppercase">Buy on eBay</p>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">{displayName}</h1>
            {card?.setName && (
              <p className="text-muted-foreground mb-4">{card.setName}{card.setSeries ? ` — ${card.setSeries}` : ''}</p>
            )}

            {card && (
              <div className="flex flex-wrap gap-2 mb-6">
                {card.rarity && (
                  <Badge variant="secondary">{card.rarity}</Badge>
                )}
                {card.priceVariant && (
                  <Badge variant="outline">{card.priceVariant}</Badge>
                )}
              </div>
            )}

            {/* Price overview */}
            {card && (card.tcgPlayerPrice != null || card.priceLow != null) && (
              <div className="rounded-xl border border-border bg-muted/50 p-5 mb-6">
                <h3 className="text-sm font-semibold mb-3">TCGPlayer Price Guide</h3>
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
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a
                href={ebaySearchUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Search on eBay
                <ExternalLink className="h-4 w-4" />
              </a>
              {card?.tcgPlayerUrl && (
                <a
                  href={buildTcgPlayerAffiliateUrl(card.tcgPlayerUrl)}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full font-semibold hover:border-primary/30 hover:text-primary transition-all duration-200"
                >
                  Buy on TCGPlayer
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Cached Listings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {listings.length > 0 ? 'Available on eBay' : 'Shop on eBay'}
            </h2>
            <a
              href={ebaySearchUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              See all on eBay &rarr;
            </a>
          </div>

          {listings.length > 0 ? (
            <ListingGrid listings={listings} customId={`buy-card-${slug}`} />
          ) : (
            <div className="text-center py-16 rounded-xl border border-border bg-muted/30">
              <p className="text-muted-foreground mb-4">
                Live listings will appear here once eBay indexing is configured.
              </p>
              <a
                href={ebaySearchUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-full text-sm font-medium hover:border-primary/30 hover:text-primary transition-all duration-200"
              >
                Search eBay for {displayName}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </section>

        {/* Related Cards */}
        {relatedCards.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border">
            <h2 className="text-xl font-semibold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedCards.map((rc) => (
                <Link key={rc.id} href={`/buy/${cardToSlug(rc.cardName, rc.setName)}`}>
                  <div className="group rounded-xl border border-border p-3 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                    <div className="relative aspect-[2.5/3.5] mb-2 overflow-hidden rounded-lg">
                      <Image
                        src={rc.imageSmall}
                        alt={rc.cardName}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    </div>
                    <h3 className="text-xs font-semibold truncate group-hover:text-primary transition-colors duration-200">
                      {rc.cardName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{rc.setName}</p>
                    <div className="flex items-center justify-between mt-1">
                      {rc.rarity && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                          {rc.rarity}
                        </Badge>
                      )}
                      {rc.tcgPlayerPrice != null && (
                        <span className="text-xs font-medium text-primary">
                          ${rc.tcgPlayerPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
