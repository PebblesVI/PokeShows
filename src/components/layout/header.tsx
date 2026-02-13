import Link from "next/link"
import { MobileNav } from "@/components/layout/mobile-nav"

const navLinks = [
  { href: "/shows", label: "Shows" },
  { href: "/shows/near-me", label: "Near Me" },
  { href: "/card-of-the-day", label: "Card of the Day" },
  { href: "/buy", label: "Buy Cards" },
  { href: "/collection", label: "Collection" },
  { href: "/trending", label: "Trending" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/blog", label: "Blog" },
] as const

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          <span className="text-primary">Poke</span>Shows
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <MobileNav />
      </div>
    </header>
  )
}
