import { ListingCard } from './listing-card';

interface Listing {
  title: string;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  itemUrl: string;
  condition: string | null;
  seller: string | null;
  listingType: string | null;
  endTime: string | null;
}

interface ListingGridProps {
  listings: Listing[];
  customId?: string;
  emptyMessage?: string;
}

export function ListingGrid({ listings, customId, emptyMessage }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {emptyMessage || 'No listings found. Check back soon!'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.itemUrl}
          title={listing.title}
          price={listing.price}
          currency={listing.currency ?? 'USD'}
          imageUrl={listing.imageUrl}
          itemUrl={listing.itemUrl}
          condition={listing.condition}
          seller={listing.seller}
          listingType={listing.listingType}
          endTime={listing.endTime}
          customId={customId}
        />
      ))}
    </div>
  );
}
