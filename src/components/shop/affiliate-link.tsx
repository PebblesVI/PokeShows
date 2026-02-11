import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildEbaySearchUrl } from '@/lib/ebay';

interface AffiliateLinkProps {
  label: string;
  searchQuery: string;
  category?: string;
  customId?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

export function AffiliateLink({ label, searchQuery, category, customId, variant = 'outline' }: AffiliateLinkProps) {
  const url = buildEbaySearchUrl({ searchQuery, category, customId });

  return (
    <Button variant={variant} asChild className="w-full justify-between">
      <a href={url} target="_blank" rel="noopener noreferrer nofollow">
        {label}
        <ExternalLink className="h-4 w-4 ml-2" />
      </a>
    </Button>
  );
}
