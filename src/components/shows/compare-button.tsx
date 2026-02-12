'use client';

import { Scale } from 'lucide-react';
import { toggleCompare, useCompare } from './compare-content';

export function CompareButton({ slug }: { slug: string }) {
  const compareSlugs = useCompare();
  const isComparing = compareSlugs.includes(slug);
  const isFull = compareSlugs.length >= 3 && !isComparing;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isFull) toggleCompare(slug);
      }}
      disabled={isFull}
      className={`p-1.5 rounded-full transition-colors ${
        isComparing
          ? 'bg-primary/10 text-primary'
          : isFull
            ? 'opacity-30 cursor-not-allowed text-muted-foreground'
            : 'hover:bg-accent/20 text-muted-foreground'
      }`}
      aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
      title={isFull ? 'Max 3 shows to compare' : isComparing ? 'Remove from compare' : 'Add to compare'}
    >
      <Scale className="h-4 w-4" />
    </button>
  );
}
