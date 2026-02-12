"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Dices, Sparkles, ExternalLink, Loader2 } from "lucide-react"
import { AddToWishlistButton } from "@/components/wishlist/add-to-wishlist-button"

interface RolledCard {
  id: string
  name: string
  setName: string
  setSeries: string
  rarity: string | null
  artist: string | null
  number: string
  types: string[] | null
  hp: string | null
  flavorText: string | null
  imageSmall: string
  imageLarge: string
  tcgPlayerUrl: string | null
  marketPrice: number | null
  priceVariant: string | null
}

interface InitialCard {
  cardName: string
  setName: string
  setSeries: string | null
  rarity: string | null
  artist: string | null
  cardNumber: string | null
  imageSmall: string
  imageLarge: string
  tcgPlayerUrl: string | null
  tcgPlayerPrice: number | null
  priceVariant: string | null
}

function formatVariant(variant: string): string {
  return variant
    .replace(/([A-Z])/g, " $1")
    .replace(/1st/, "1st")
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

export function CardRoller({
  initialCard,
  compact = false,
}: {
  initialCard: InitialCard | null
  compact?: boolean
}) {
  const [card, setCard] = useState<RolledCard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isHoloLoading, setIsHoloLoading] = useState(false)
  const [flipKey, setFlipKey] = useState(0)

  // Card pools for instant re-rolls
  const normalPool = useRef<RolledCard[]>([])
  const holoPool = useRef<RolledCard[]>([])

  const displayCard = card
    ? {
        id: card.id,
        name: card.name,
        setName: card.setName,
        rarity: card.rarity,
        artist: card.artist,
        imageSmall: card.imageSmall,
        imageLarge: card.imageLarge,
        tcgPlayerUrl: card.tcgPlayerUrl,
        marketPrice: card.marketPrice,
        priceVariant: card.priceVariant,
      }
    : initialCard
      ? {
          id: null as string | null,
          name: initialCard.cardName,
          setName: initialCard.setName,
          rarity: initialCard.rarity,
          artist: initialCard.artist,
          imageSmall: initialCard.imageSmall,
          imageLarge: initialCard.imageLarge,
          tcgPlayerUrl: initialCard.tcgPlayerUrl,
          marketPrice: initialCard.tcgPlayerPrice,
          priceVariant: initialCard.priceVariant,
        }
      : null

  const fetchPool = useCallback(async (holo: boolean): Promise<RolledCard[]> => {
    const url = holo ? "/api/random-card?holo=true" : "/api/random-card"
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch cards")
    const data = await response.json()
    return data.cards || []
  }, [])

  const rollCard = useCallback(async (holo: boolean) => {
    const pool = holo ? holoPool : normalPool

    // If pool has cards, use one instantly
    if (pool.current.length > 0) {
      const next = pool.current.pop()!
      setCard(next)
      setFlipKey((k) => k + 1)

      // Refill in the background when pool gets low
      if (pool.current.length < 3) {
        fetchPool(holo).then((cards) => {
          pool.current.push(...cards)
        }).catch(() => {})
      }
      return
    }

    // First roll — need to fetch
    if (holo) {
      setIsHoloLoading(true)
    } else {
      setIsLoading(true)
    }

    try {
      const cards = await fetchPool(holo)
      if (cards.length > 0) {
        const next = cards.pop()!
        pool.current = cards
        setCard(next)
        setFlipKey((k) => k + 1)
      }
    } catch (error) {
      console.error("Failed to roll card:", error)
    } finally {
      setIsLoading(false)
      setIsHoloLoading(false)
    }
  }, [fetchPool])

  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        {/* Card image */}
        <div className="w-48 flex-shrink-0">
          {displayCard ? (
            <div className="relative">
              <Image
                key={flipKey}
                src={displayCard.imageLarge}
                alt={displayCard.name}
                width={367}
                height={512}
                className={`rounded-xl shadow-lg transition-all duration-300 ${isLoading || isHoloLoading ? "opacity-50 scale-95" : "animate-in fade-in zoom-in-95 duration-300"}`}
              />
              {(isLoading || isHoloLoading) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[2.5/3.5] rounded-xl bg-muted flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No card yet</p>
            </div>
          )}
        </div>

        {/* Card info + buttons */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-primary font-medium mb-1 tracking-wide uppercase">
            Card of the Day
          </p>
          {displayCard ? (
            <>
              <h3 className="text-2xl font-bold mb-1 tracking-tight">
                {displayCard.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {displayCard.setName}
              </p>
              {displayCard.rarity && (
                <Badge variant="secondary" className="mb-3">
                  {displayCard.rarity}
                </Badge>
              )}
              {displayCard.marketPrice != null && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-semibold text-primary">
                    ${displayCard.marketPrice.toFixed(2)}
                  </span>
                  {displayCard.priceVariant && (
                    <span className="text-xs text-muted-foreground">
                      {formatVariant(displayCard.priceVariant)}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground mb-4">
              Roll to discover a card!
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => rollCard(false)}
              disabled={isLoading || isHoloLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-full hover:border-primary/30 hover:text-primary transition-all duration-200 disabled:opacity-50"
            >
              <Dices className="h-4 w-4" />
              Roll New Card
            </button>
            <button
              onClick={() => rollCard(true)}
              disabled={isLoading || isHoloLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              I&apos;m Feeling Lucky
            </button>
          </div>

          {displayCard?.tcgPlayerUrl && (
            <a
              href={displayCard.tcgPlayerUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-3 transition-colors"
            >
              View on TCGPlayer <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    )
  }

  // Full-size version for the card-of-the-day page
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => rollCard(false)}
          disabled={isLoading || isHoloLoading}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-border rounded-full hover:border-primary/30 hover:text-primary transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Dices className="h-4 w-4" />
          )}
          Roll Random Card
        </button>
        <button
          onClick={() => rollCard(true)}
          disabled={isLoading || isHoloLoading}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isHoloLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          I&apos;m Feeling Lucky (Holos)
        </button>
      </div>

      {card && (
        <div
          key={flipKey}
          className="flex flex-col md:flex-row gap-8 items-start w-full mt-4 p-6 rounded-xl border-2 border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="w-full md:w-1/3 max-w-xs mx-auto md:mx-0">
            <Image
              src={card.imageLarge}
              alt={card.name}
              width={734}
              height={1024}
              className="rounded-xl shadow-lg"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-primary font-medium mb-1 tracking-wide uppercase">
              You rolled:
            </p>
            <h3 className="text-2xl font-bold mb-4 tracking-tight">
              {card.name}
            </h3>
            <div className="space-y-2 text-sm mb-4">
              <p>
                <span className="text-muted-foreground">Set:</span>{" "}
                {card.setName}
                {card.setSeries ? ` (${card.setSeries})` : ""}
              </p>
              {card.rarity && (
                <p>
                  <span className="text-muted-foreground">Rarity:</span>{" "}
                  {card.rarity}
                </p>
              )}
              {card.artist && (
                <p>
                  <span className="text-muted-foreground">Artist:</span>{" "}
                  {card.artist}
                </p>
              )}
              {card.marketPrice != null && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Market:</span>
                  <span className="text-lg font-semibold text-primary">
                    ${card.marketPrice.toFixed(2)}
                  </span>
                  {card.priceVariant && (
                    <Badge variant="outline" className="text-xs">
                      {formatVariant(card.priceVariant)}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {card.tcgPlayerUrl && (
                <a
                  href={card.tcgPlayerUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View on TCGPlayer <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <AddToWishlistButton
                cardId={card.id}
                name={card.name}
                setName={card.setName}
                imageSmall={card.imageSmall}
                rarity={card.rarity}
                size="default"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
