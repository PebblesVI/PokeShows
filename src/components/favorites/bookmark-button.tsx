'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from './favorites-provider';

export function BookmarkButton({ slug, size = 'icon' }: { slug: string; size?: 'icon' | 'default' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(slug);

  if (size === 'default') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => { e.preventDefault(); toggleFavorite(slug); }}
        className="gap-2"
      >
        <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
        {saved ? 'Saved' : 'Save'}
      </Button>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(slug); }}
      className="p-1.5 rounded-full hover:bg-accent/20 transition-colors"
      aria-label={saved ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
    </button>
  );
}
