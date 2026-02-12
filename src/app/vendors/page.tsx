export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db';
import { vendors } from '@/db/schema';
import { desc, asc } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, Star, Store } from 'lucide-react';
import { US_STATE_NAMES } from '@/lib/constants';
import { VendorRegisterForm } from '@/components/vendors/vendor-register-form';

export const metadata: Metadata = {
  title: 'Pokemon Card Vendors & Dealers Directory',
  description: 'Find trusted Pokemon card vendors, dealers, and shops near you. Browse verified sellers specializing in vintage, graded, Japanese cards, and more.',
};

export default async function VendorsPage() {
  const allVendors = await db
    .select()
    .from(vendors)
    .orderBy(desc(vendors.isFeatured), asc(vendors.name));

  const featuredVendors = allVendors.filter((v) => v.isFeatured);
  const regularVendors = allVendors.filter((v) => !v.isFeatured);

  // Group regular vendors by state
  const vendorsByState: Record<string, typeof allVendors> = {};
  for (const vendor of regularVendors) {
    if (!vendorsByState[vendor.state]) {
      vendorsByState[vendor.state] = [];
    }
    vendorsByState[vendor.state].push(vendor);
  }

  const sortedStates = Object.keys(vendorsByState).sort();

  function parseSpecialties(specialties: string | null): string[] {
    if (!specialties) return [];
    try {
      return JSON.parse(specialties);
    } catch {
      return [];
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Pokemon Card Vendors & Dealers</h1>
        <p className="text-muted-foreground">
          Find trusted Pokemon card vendors, dealers, and shops across the United States.
        </p>
      </div>

      {/* Featured Vendors */}
      {featuredVendors.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Vendors
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredVendors.map((vendor) => {
              const specialties = parseSpecialties(vendor.specialties);
              return (
                <Link key={vendor.id} href={`/vendors/${vendor.slug}`}>
                  <div className="rounded-xl border-2 border-yellow-400/60 bg-yellow-50/50 dark:bg-yellow-900/10 p-5 h-full transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold leading-tight">{vendor.name}</h3>
                      <Badge className="bg-yellow-400 text-yellow-900 rounded-full text-xs shrink-0">
                        Featured
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{vendor.city ? `${vendor.city}, ` : ''}{US_STATE_NAMES[vendor.state] || vendor.state}</span>
                    </div>
                    {vendor.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {vendor.description}
                      </p>
                    )}
                    {specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {specialties.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs rounded-full">{s}</Badge>
                        ))}
                      </div>
                    )}
                    {vendor.website && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-primary">
                        <Globe className="h-3 w-3" />
                        <span>Visit Website</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Vendors by State */}
      {sortedStates.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">All Vendors by State</h2>
          {sortedStates.map((state) => (
            <div key={state} className="mb-8">
              <h3 className="text-lg font-medium mb-3 text-primary">
                {US_STATE_NAMES[state] || state}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {vendorsByState[state].map((vendor) => {
                  const specialties = parseSpecialties(vendor.specialties);
                  return (
                    <Link key={vendor.id} href={`/vendors/${vendor.slug}`}>
                      <div className="rounded-xl border border-border p-5 h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                        <h4 className="font-semibold leading-tight mb-2">{vendor.name}</h4>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{vendor.city ? `${vendor.city}, ` : ''}{US_STATE_NAMES[vendor.state] || vendor.state}</span>
                        </div>
                        {vendor.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {vendor.description}
                          </p>
                        )}
                        {specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {specialties.map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs rounded-full">{s}</Badge>
                            ))}
                          </div>
                        )}
                        {vendor.website && (
                          <div className="flex items-center gap-1 mt-3 text-xs text-primary">
                            <Globe className="h-3 w-3" />
                            <span>Visit Website</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ) : featuredVendors.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/30 p-8 text-center mb-12">
          <Store className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No vendors yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to register your business in our vendor directory!
          </p>
        </div>
      ) : null}

      {/* Get Featured CTA */}
      <section className="mb-12">
        <div className="rounded-xl border-2 border-yellow-400/60 bg-yellow-50/30 dark:bg-yellow-900/10 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Get Featured</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Stand out from the crowd with a Featured Vendor listing. Get a yellow border, top placement, and inclusion in pre-show emails sent to collectors.
          </p>
          <div className="grid gap-3 sm:grid-cols-3 mb-5">
            {[
              { label: 'Top Placement', desc: 'Appear above all other vendors' },
              { label: 'Pre-Show Emails', desc: 'Featured in show prep kit emails' },
              { label: 'Show Pages', desc: 'Listed on individual show pages' },
            ].map(item => (
              <div key={item.label} className="rounded-lg border border-yellow-300/50 bg-white/50 dark:bg-background p-3 text-center">
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/vendors/featured"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-yellow-900 font-semibold rounded-full hover:bg-yellow-500 transition-colors text-sm"
            >
              Get Featured — $10/month
            </Link>
            <span className="text-xs text-muted-foreground">or $5/show • No contracts</span>
          </div>
        </div>
      </section>

      {/* Register CTA */}
      <section>
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-2">Register Your Business</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Are you a Pokemon card vendor, dealer, or shop? List your business in our directory to reach collectors in your area.
          </p>
          <VendorRegisterForm />
        </div>
      </section>
    </div>
  );
}
