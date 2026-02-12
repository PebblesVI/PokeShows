"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/shows", label: "Shows" },
  { href: "/card-of-the-day", label: "Card of the Day" },
  { href: "/buy", label: "Buy Cards" },
  { href: "/buy/category/accessories", label: "Accessories" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/about", label: "About" },
] as const

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close the menu when the route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm border-l border-border bg-background p-6 shadow-xl transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-lg font-bold text-primary"
          >
            PokeShows
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "rounded-full px-4 py-2.5 text-base font-medium transition-colors duration-200 hover:bg-muted hover:text-foreground",
                pathname === link.href || pathname?.startsWith(link.href + "/")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
