import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { JsonLdWebsite } from "@/components/seo/json-ld-website"
import { FavoritesProvider } from "@/components/favorites/favorites-provider"
import { WishlistProvider } from "@/components/wishlist/wishlist-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "PokeShows - Pokemon Card Shows, Expos & Events Finder",
    template: "%s | PokeShows",
  },
  description:
    "Find Pokemon card shows, expos, and trading events near you. Browse the Card of the Day, shop deals from trusted eBay sellers, and never miss a Pokemon TCG event.",
  keywords: [
    "Pokemon card shows",
    "Pokemon TCG events",
    "Pokemon card expos",
    "trading card shows",
    "Pokemon card trading",
    "card of the day",
    "Pokemon cards",
    "TCG events near me",
    "Pokemon card shop",
    "Collect-A-Con",
  ],
  authors: [{ name: "PokeShows" }],
  creator: "PokeShows",
  metadataBase: new URL("https://pokeshows.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pokeshows.com",
    siteName: "PokeShows",
    title: "PokeShows - Pokemon Card Shows, Expos & Events Finder",
    description:
      "Find Pokemon card shows, expos, and trading events near you. Browse the Card of the Day, shop deals, and never miss a Pokemon TCG event.",
    images: [
      {
        url: "/api/og?title=PokeShows&subtitle=Pokemon+Card+Shows,+Expos+%26+Events+Finder",
        width: 1200,
        height: 630,
        alt: "PokeShows - Pokemon Card Shows & Events Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PokeShows - Pokemon Card Shows, Expos & Events Finder",
    description:
      "Find Pokemon card shows, expos, and trading events near you. Browse the Card of the Day, shop deals, and never miss a Pokemon TCG event.",
    images: ["/api/og?title=PokeShows&subtitle=Pokemon+Card+Shows,+Expos+%26+Events+Finder"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FavoritesProvider>
            <WishlistProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </WishlistProvider>
          </FavoritesProvider>
          <JsonLdWebsite />
        </ThemeProvider>
      </body>
    </html>
  )
}
