'use client';

import type { CardOfTheDay } from '@/types/card';

export function CardShareButtons({ card }: { card: CardOfTheDay }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeshows.com';
  const shareUrl = `${siteUrl}/card-of-the-day`;
  const shareText = `Today's Pokemon Card of the Day: ${card.cardName} from ${card.setName}!`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex items-center gap-3 mt-4">
      <span className="text-sm text-muted-foreground">Share:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        Twitter/X
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        Facebook
      </a>
    </div>
  );
}
