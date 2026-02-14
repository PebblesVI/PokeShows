import Link from "next/link"

const quickLinks = [
  { href: "/shows", label: "Shows" },
  { href: "/card-of-the-day", label: "Card of the Day" },
  { href: "/buy", label: "Buy Cards" },
  { href: "/collection", label: "My Collection" },
  { href: "/trending", label: "Trending Cards" },
  { href: "/sets/calendar", label: "Set Calendar" },
  { href: "/wishlist", label: "Card Wishlist" },
  { href: "/collection/trades", label: "Trade Binder" },
  { href: "/achievements", label: "Achievements" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/pro", label: "PokeShows Pro" },
  { href: "/submit", label: "Submit a Show" },
  { href: "/about", label: "About" },
] as const

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight"
            >
              <span className="text-primary">Poke</span>Shows
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              Find Pokemon card shows, expos, and trading events near you.
              Browse the latest cards and shop deals from trusted sellers.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              Disclosures
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Affiliate Disclosure: We earn commissions from qualifying eBay
              purchases.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Data sourced from TCDB, Collect-A-Con, and other public listings.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {currentYear} PokeShows. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
