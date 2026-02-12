"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"

interface PricePoint {
  date: string
  market: number | null
  low: number | null
  high: number | null
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function PriceSparkline({ data }: { data: PricePoint[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const prices = data.map((d) => d.market).filter((p): p is number => p != null)
  if (prices.length < 2) return null

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  const width = 400
  const height = 120
  const padding = { top: 10, bottom: 25, left: 10, right: 10 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Build points for the polyline
  const points: { x: number; y: number; price: number; date: string }[] = []
  let pointIndex = 0
  for (const point of data) {
    if (point.market != null) {
      const x =
        padding.left +
        (pointIndex / (prices.length - 1)) * chartWidth
      const y =
        padding.top +
        chartHeight -
        ((point.market - minPrice) / priceRange) * chartHeight
      points.push({ x, y, price: point.market, date: point.date })
      pointIndex++
    }
  }

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ")

  // Gradient fill area
  const areaPath = `M ${points[0].x},${points[0].y} ${points.map((p) => `L ${p.x},${p.y}`).join(" ")} L ${points[points.length - 1].x},${padding.top + chartHeight} L ${points[0].x},${padding.top + chartHeight} Z`

  const priceChange = prices[prices.length - 1] - prices[0]
  const isUp = priceChange >= 0

  return (
    <div className="relative">
      {hoveredIndex != null && points[hoveredIndex] && (
        <div className="absolute top-0 left-0 bg-background border border-border rounded-lg px-3 py-1.5 text-xs shadow-sm z-10 pointer-events-none">
          <span className="font-semibold">
            ${points[hoveredIndex].price.toFixed(2)}
          </span>
          <span className="text-muted-foreground ml-2">
            {formatDate(points[hoveredIndex].date)}
          </span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-md"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id="priceGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={isUp ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
              stopOpacity="0.2"
            />
            <stop
              offset="100%"
              stopColor={isUp ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#priceGradient)" />

        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={isUp ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points + hover areas */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === i ? 4 : 2.5}
              fill={
                isUp ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"
              }
              stroke="hsl(var(--background))"
              strokeWidth="1.5"
              className="transition-all duration-150"
            />
            {/* Invisible larger hit area */}
            <circle
              cx={point.x}
              cy={point.y}
              r={15}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            />
          </g>
        ))}

        {/* X-axis labels (first and last) */}
        <text
          x={points[0].x}
          y={height - 4}
          textAnchor="start"
          className="fill-muted-foreground"
          fontSize="10"
        >
          {formatDate(points[0].date)}
        </text>
        <text
          x={points[points.length - 1].x}
          y={height - 4}
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize="10"
        >
          {formatDate(points[points.length - 1].date)}
        </text>
      </svg>
    </div>
  )
}

export function PriceChart({ pokemonTcgId }: { pokemonTcgId: string }) {
  const [data, setData] = useState<PricePoint[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(
          `/api/card-price-history/${encodeURIComponent(pokemonTcgId)}`
        )
        if (!response.ok) throw new Error("Failed to fetch")
        const json = await response.json()
        setData(json.history)
      } catch {
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [pokemonTcgId])

  if (loading) {
    return (
      <div className="h-20 rounded-lg bg-muted/50 animate-pulse" />
    )
  }

  if (!data || data.length < 2) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>Price tracking started — chart coming soon</span>
      </div>
    )
  }

  const prices = data.map((d) => d.market).filter((p): p is number => p != null)
  const latestPrice = prices[prices.length - 1]
  const firstPrice = prices[0]
  const change = latestPrice - firstPrice
  const changePercent = ((change / firstPrice) * 100).toFixed(1)

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-2">
        <h4 className="text-sm font-medium">Price History</h4>
        {change !== 0 && (
          <span
            className={`text-xs font-medium ${change >= 0 ? "text-green-600" : "text-red-500"}`}
          >
            {change >= 0 ? "+" : ""}
            {changePercent}%
          </span>
        )}
      </div>
      <PriceSparkline data={data} />
    </div>
  )
}
