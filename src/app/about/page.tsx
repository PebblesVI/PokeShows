import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About PokeShows',
  description: 'PokeShows is the ultimate directory of Pokemon and trading card shows across the United States.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">About PokeShows</h1>

      <div className="max-w-none space-y-6">
        <p className="text-lg text-muted-foreground">
          PokeShows is the ultimate directory for finding Pokemon and trading card shows
          across the United States. We aggregate show listings from multiple sources to
          give you a single, easy-to-browse directory of upcoming events.
        </p>

        <h2 className="text-xl font-semibold mt-8">What We Do</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Aggregate card show listings from across the web</li>
          <li>Feature a new Pokemon Card of the Day every day</li>
          <li>Help you find shows by state and date</li>
          <li>Provide curated shopping links for Pokemon cards on eBay</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">Data Sources</h2>
        <p className="text-muted-foreground">
          Our show listings are sourced from public event listings including TCDB,
          Collect-A-Con, Card Party, and other organizer websites. Card data is provided
          by the Pokemon TCG API.
        </p>

        <h2 className="text-xl font-semibold mt-8">Affiliate Disclosure</h2>
        <p className="text-muted-foreground">
          PokeShows is a participant in the eBay Partner Network, an affiliate advertising
          program designed to provide a means for sites to earn advertising fees by linking
          to eBay.com. When you click on our eBay links and make a purchase, we may earn a
          small commission at no additional cost to you.
        </p>

        <h2 className="text-xl font-semibold mt-8">Contact</h2>
        <p className="text-muted-foreground">
          Have a show to add or a correction to report?{' '}
          Reach out to us and we&apos;ll get it updated.
        </p>

        <div className="mt-8 pt-8 border-t border-border">
          <Link href="/shows" className="text-primary hover:underline">
            Browse upcoming shows
          </Link>
        </div>
      </div>
    </div>
  );
}
