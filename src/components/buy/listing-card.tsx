import Image from 'next/image';
import { ExternalLink, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buildEbayItemUrl } from '@/lib/ebay';

interface ListingCardProps {
  title: string;
  price: number | null;
  currency?: string;
  imageUrl: string | null;
  itemUrl: string;
  condition: string | null;
  seller: string | null;
  listingType: string | null;
  endTime: string | null;
  customId?: string;
}

function formatCondition(condition: string): string {
  return condition
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^./, c => c.toUpperCase());
}

function getTimeRemaining(endTime: string): string | null {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h left`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}m left`;
}

export function ListingCard({
  title,
  price,
  imageUrl,
  itemUrl,
  condition,
  listingType,
  endTime,
  customId,
}: ListingCardProps) {
  const affiliateUrl = buildEbayItemUrl(itemUrl, customId);
  const isAuction = listingType?.includes('AUCTION');
  const timeRemaining = endTime ? getTimeRemaining(endTime) : null;

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="nofollow noopener noreferrer"
      className="group block"
    >
      <div className="rounded-xl border border-border p-3 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
        <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-muted/30">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No image
            </div>
          )}
          {isAuction && timeRemaining && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
              <Clock className="h-3 w-3 text-orange-500" />
              {timeRemaining}
            </div>
          )}
        </div>

        <h3 className="text-sm font-medium leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>

        <div className="flex items-center justify-between gap-2">
          {price != null ? (
            <span className="text-lg font-bold text-primary">${price.toFixed(2)}</span>
          ) : (
            <span className="text-sm text-muted-foreground">See price</span>
          )}
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          {condition && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
              {formatCondition(condition)}
            </Badge>
          )}
          {isAuction && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full">
              Auction
            </Badge>
          )}
        </div>
      </div>
    </a>
  );
}
