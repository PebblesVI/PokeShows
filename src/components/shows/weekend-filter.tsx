"use client"

import { useState, useMemo } from "react"
import { ShowList } from "@/components/shows/show-list"
import { US_STATE_NAMES } from "@/lib/constants"
import type { Show } from "@/types/show"

export function WeekendFilter({ shows }: { shows: Show[] }) {
  const [selectedState, setSelectedState] = useState<string>("all")

  const statesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const show of shows) {
      counts[show.state] = (counts[show.state] || 0) + 1
    }
    return Object.entries(counts)
      .sort(([a], [b]) => (US_STATE_NAMES[a] || a).localeCompare(US_STATE_NAMES[b] || b))
  }, [shows])

  const filteredShows = useMemo(() => {
    if (selectedState === "all") return shows
    return shows.filter(show => show.state === selectedState)
  }, [shows, selectedState])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <label htmlFor="state-filter" className="text-sm font-medium text-muted-foreground">
          Filter by state:
        </label>
        <select
          id="state-filter"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All States ({shows.length})</option>
          {statesWithCounts.map(([state, count]) => (
            <option key={state} value={state}>
              {US_STATE_NAMES[state] || state} ({count})
            </option>
          ))}
        </select>
      </div>

      {selectedState !== "all" && (
        <p className="text-sm text-muted-foreground mb-6">
          Showing {filteredShows.length} show{filteredShows.length !== 1 ? "s" : ""} in {US_STATE_NAMES[selectedState] || selectedState}
        </p>
      )}

      <ShowList shows={filteredShows} />
    </div>
  )
}
