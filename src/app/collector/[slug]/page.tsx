import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { db } from '@/db';
import { collectorProfiles, collectionCards, cardPriceHistory } from '@/db/schema';
import { eq, desc, sql, count, countDistinct } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { Users, TrendingUp, ArrowRightLeft, Layers, Calendar, Heart, ExternalLink } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await db.query.collectorProfiles.findFirst({
    where: eq(collectorProfiles.slug, slug),
  });

  if (!profile) return { title: 'Collector Not Found' };

  const title = `${profile.displayName} - Collector Profile | PokeShows`;
  const description = profile.bio
    ? `${profile.displayName}'s Pokemon card collection on PokeShows. ${profile.bio}`
    : `Check out ${profile.displayName}'s Pokemon card collection on PokeShows.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/collector/${slug}`,
    },
  };
}

export default async function CollectorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const profile = await db.query.collectorProfiles.findFirst({
    where: eq(collectorProfiles.slug, slug),
  });

  if (!profile) notFound();

  // Get collection stats
  const [cardStats] = await db
    .select({
      totalCards: count(),
      forTradeCount: sql<number>`SUM(CASE WHEN ${collectionCards.forTrade} = 1 THEN 1 ELSE 0 END)`,
      setsCollected: countDistinct(collectionCards.setId),
    })
    .from(collectionCards)
    .where(eq(collectionCards.email, profile.email));

  // Get all cards for value calculation and highlights
  const allCards = await db
    .select()
    .from(collectionCards)
    .where(eq(collectionCards.email, profile.email));

  // Get current prices for all cards
  const cardsWithPrices: {
    card: typeof allCards[0];
    currentPrice: number;
  }[] = [];

  let totalValue = 0;

  for (const card of allCards) {
    const [latestPrice] = await db
      .select({
        priceMarket: cardPriceHistory.priceMarket,
        priceMid: cardPriceHistory.priceMid,
      })
      .from(cardPriceHistory)
      .where(eq(cardPriceHistory.pokemonTcgId, card.pokemonTcgId))
      .orderBy(desc(cardPriceHistory.recordedDate))
      .limit(1);

    const price = latestPrice?.priceMarket ?? latestPrice?.priceMid ?? 0;
    totalValue += price;
    cardsWithPrices.push({ card, currentPrice: price });
  }

  // Most valuable cards (top 8)
  const highlights = cardsWithPrices
    .filter((c) => c.currentPrice > 0)
    .sort((a, b) => b.currentPrice - a.currentPrice)
    .slice(0, 8);

  // Cards for trade
  const tradeCards = cardsWithPrices.filter((c) => c.card.forTrade);

  const joinDate = format(new Date(profile.createdAt), 'MMMM yyyy');

  const stats = [
    { label: 'Cards', value: cardStats?.totalCards ?? 0, icon: Layers },
    { label: 'Est. Value', value: `$${totalValue.toFixed(2)}`, icon: TrendingUp },
    { label: 'Sets', value: cardStats?.setsCollected ?? 0, icon: Layers },
    { label: 'For Trade', value: cardStats?.forTradeCount ?? 0, icon: ArrowRightLeft },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="rounded-xl border border-border p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shrink-0">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">{profile.displayName}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {joinDate}
              </span>
              {profile.favoriteSet && (
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {profile.favoriteSet}
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="text-muted-foreground mt-3 max-w-2xl">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border p-4 text-center hover:border-primary/30 transition-colors"
            >
              <stat.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Collection Highlights */}
      {highlights.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Collection Highlights
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {highlights.map(({ card, currentPrice }) => (
              <div
                key={card.pokemonTcgId}
                className="rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all hover:shadow-sm group"
              >
                <div className="aspect-[2.5/3.5] relative bg-muted">
                  <img
                    src={card.imageSmall}
                    alt={card.cardName}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{card.cardName}</p>
                  <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      ${currentPrice.toFixed(2)}
                    </span>
                    {card.rarity && (
                      <Badge variant="secondary" className="text-[10px]">
                        {card.rarity}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cards for Trade */}
      {tradeCards.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Cards for Trade
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tradeCards.map(({ card, currentPrice }) => {
              const ebayUrl = buildEbaySearchUrl({
                searchQuery: `pokemon ${card.cardName} ${card.setName}`,
                customId: `trade-${profile.slug}`,
              });

              return (
                <div
                  key={card.pokemonTcgId}
                  className="flex gap-4 rounded-xl border border-border p-4 hover:border-primary/30 transition-all"
                >
                  <div className="w-16 h-22 shrink-0">
                    <img
                      src={card.imageSmall}
                      alt={card.cardName}
                      className="w-full rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{card.cardName}</p>
                    <p className="text-xs text-muted-foreground truncate">{card.setName}</p>
                    {card.rarity && (
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {card.rarity}
                      </Badge>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {currentPrice > 0 && (
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          ~${currentPrice.toFixed(2)}
                        </span>
                      )}
                      <a
                        href={ebayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        eBay <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {allCards.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">This collector hasn&apos;t added any cards yet.</p>
        </div>
      )}
    </div>
  );
}
