export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { vendors } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { US_STATE_NAMES } from '@/lib/constants';
import { MapPin, Globe, Mail, ExternalLink, Star, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const SPECIALTY_EBAY_QUERIES: Record<string, string> = {
  vintage: 'vintage pokemon card base set holo',
  graded: 'PSA graded pokemon card',
  japanese: 'pokemon card japanese',
  sealed: 'pokemon booster box sealed',
  singles: 'pokemon card single rare',
  accessories: 'pokemon card sleeves binder top loader',
  bulk: 'pokemon card bulk lot',
  custom: 'custom pokemon card accessories',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.slug, slug))
    .limit(1);

  if (!vendor) {
    return { title: 'Vendor Not Found' };
  }

  return {
    title: `${vendor.name} — Pokemon Card Vendor in ${US_STATE_NAMES[vendor.state] || vendor.state}`,
    description: vendor.description || `${vendor.name} is a Pokemon card vendor in ${vendor.city ? `${vendor.city}, ` : ''}${US_STATE_NAMES[vendor.state] || vendor.state}.`,
  };
}

export default async function VendorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.slug, slug))
    .limit(1);

  if (!vendor) {
    notFound();
  }

  let specialties: string[] = [];
  if (vendor.specialties) {
    try {
      specialties = JSON.parse(vendor.specialties);
    } catch {
      specialties = [];
    }
  }

  const locationStr = vendor.city
    ? `${vendor.city}, ${US_STATE_NAMES[vendor.state] || vendor.state}`
    : US_STATE_NAMES[vendor.state] || vendor.state;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/vendors" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        &larr; Back to Vendor Directory
      </Link>

      <div className="rounded-xl border border-border p-6 mb-8">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">{vendor.name}</h1>
          <div className="flex items-center gap-2 shrink-0">
            {vendor.isFeatured && (
              <Badge className="bg-yellow-400 text-yellow-900 rounded-full text-xs">
                <Star className="h-3 w-3 mr-0.5" />
                Featured
              </Badge>
            )}
            {vendor.isVerified && (
              <Badge variant="default" className="rounded-full text-xs">
                <ShieldCheck className="h-3 w-3 mr-0.5" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{locationStr}</span>
        </div>

        {vendor.description && (
          <p className="text-sm leading-relaxed mb-6">{vendor.description}</p>
        )}

        {specialties.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium mb-2">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs rounded-full capitalize">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {vendor.website && (
            <a href={vendor.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4" />
                Visit Website
              </Button>
            </a>
          )}
          <a href={`mailto:${vendor.email}?subject=Inquiry from PokeShows`}>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4" />
              Contact Vendor
            </Button>
          </a>
        </div>
      </div>

      {/* eBay Affiliate Links Based on Specialties */}
      {specialties.length > 0 && (
        <div className="rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Browse Related Cards on eBay</h2>
          <div className="space-y-3">
            {specialties.map((specialty) => {
              const query = SPECIALTY_EBAY_QUERIES[specialty];
              if (!query) return null;
              return (
                <a
                  key={specialty}
                  href={buildEbaySearchUrl({ searchQuery: query, customId: `vendor-${specialty}` })}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:border-primary/30 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-medium capitalize">
                    Browse {specialty} cards
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
