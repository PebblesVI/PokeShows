'use client';

import { ListPlus, ListCheck } from 'lucide-react';
import { useWishlist } from './wishlist-provider';

interface AddToWishlistButtonProps {
  cardId: string;
  name: string;
  setName: string;
  imageSmall: string;
  rarity: string | null;
  size?: 'icon' | 'default';
}

export function AddToWishlistButton({ cardId, name, setName, imageSmall, rarity, size = 'icon' }: AddToWishlistButtonProps) {
  const { isInWishlist, toggleCard } = useWishlist();
  const inList = isInWishlist(cardId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCard({ cardId, name, setName, imageSmall, rarity });
  };

  if (size === 'default') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-full transition-all duration-200 ${
          inList
            ? 'border-primary text-primary bg-primary/10'
            : 'border-border hover:border-primary/30 hover:text-primary'
        }`}
      >
        {inList ? <ListCheck className="h-4 w-4" /> : <ListPlus className="h-4 w-4" />}
        {inList ? 'In Wishlist' : 'Add to Wishlist'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="p-1.5 rounded-full hover:bg-accent/20 transition-colors"
      aria-label={inList ? 'Remove from wishlist' : 'Add to wishlist'}
      title={inList ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {inList ? (
        <ListCheck className="h-4 w-4 text-primary" />
      ) : (
        <ListPlus className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}
