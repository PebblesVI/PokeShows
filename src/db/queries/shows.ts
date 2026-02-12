import { db } from '@/db';
import { shows } from '@/db/schema';
import { eq, and, gte, lte, lt, asc, ne, or, isNull, like, sql } from 'drizzle-orm';
import { format } from 'date-fns';

interface ShowFilters {
  state?: string;
  fromDate?: string;
  toDate?: string;
  query?: string;
  limit?: number;
}

export async function getUpcomingShows({ limit = 10 }: { limit?: number } = {}) {
  const today = format(new Date(), 'yyyy-MM-dd');
  return db.select()
    .from(shows)
    .where(and(eq(shows.isActive, true), gte(shows.startDate, today)))
    .orderBy(asc(shows.startDate))
    .limit(limit);
}

export async function getFilteredShows(filters: ShowFilters) {
  const conditions = [eq(shows.isActive, true)];

  if (filters.state) {
    conditions.push(eq(shows.state, filters.state.toUpperCase()));
  }
  if (filters.fromDate) {
    conditions.push(gte(shows.startDate, filters.fromDate));
  } else {
    conditions.push(gte(shows.startDate, format(new Date(), 'yyyy-MM-dd')));
  }
  if (filters.toDate) {
    conditions.push(lte(shows.startDate, filters.toDate));
  }
  if (filters.query) {
    const q = `%${filters.query}%`;
    conditions.push(or(
      like(shows.name, q),
      like(shows.city, q),
      like(shows.venueName, q),
    )!);
  }

  return db.select()
    .from(shows)
    .where(and(...conditions))
    .orderBy(asc(shows.startDate))
    .limit(filters.limit || 100);
}

export async function getShowBySlug(slug: string) {
  return db.query.shows.findFirst({
    where: eq(shows.slug, slug),
  });
}

export async function getShowsByState(state: string) {
  const today = format(new Date(), 'yyyy-MM-dd');
  return db.select()
    .from(shows)
    .where(and(eq(shows.isActive, true), eq(shows.state, state), gte(shows.startDate, today)))
    .orderBy(asc(shows.startDate));
}

export async function getRelatedShows(state: string, excludeId: number, limit: number) {
  const today = format(new Date(), 'yyyy-MM-dd');
  return db.select()
    .from(shows)
    .where(and(
      eq(shows.isActive, true),
      eq(shows.state, state),
      ne(shows.id, excludeId),
      gte(shows.startDate, today),
    ))
    .orderBy(asc(shows.startDate))
    .limit(limit);
}

export async function getAllShowSlugs() {
  return db.select({ slug: shows.slug })
    .from(shows)
    .where(eq(shows.isActive, true));
}

export async function getFeaturedShows(limit: number = 4) {
  const today = format(new Date(), 'yyyy-MM-dd');
  return db.select()
    .from(shows)
    .where(and(
      eq(shows.isActive, true),
      eq(shows.isFeatured, true),
      gte(shows.startDate, today),
    ))
    .orderBy(asc(shows.startDate))
    .limit(limit);
}

export async function getWeekendShows() {
  const now = new Date();
  // Find next Saturday (or today if it's Saturday)
  const day = now.getDay();
  const daysUntilSaturday = day === 6 ? 0 : day === 0 ? 6 : 6 - day;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  const satStr = format(saturday, 'yyyy-MM-dd');
  const sunStr = format(sunday, 'yyyy-MM-dd');

  return db.select()
    .from(shows)
    .where(and(
      eq(shows.isActive, true),
      gte(shows.startDate, satStr),
      lte(shows.startDate, sunStr),
    ))
    .orderBy(asc(shows.state), asc(shows.startDate));
}

export async function getShowsByCity(city: string, state: string) {
  const today = format(new Date(), 'yyyy-MM-dd');
  return db.select()
    .from(shows)
    .where(and(
      eq(shows.isActive, true),
      eq(shows.city, city),
      eq(shows.state, state),
      gte(shows.startDate, today),
    ))
    .orderBy(asc(shows.startDate));
}

export async function getAllCities() {
  return db.selectDistinct({ city: shows.city, state: shows.state })
    .from(shows)
    .where(eq(shows.isActive, true))
    .orderBy(asc(shows.state), asc(shows.city));
}

export async function getActiveShowCount(): Promise<number> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(shows)
    .where(and(eq(shows.isActive, true), gte(shows.startDate, today)));
  return result[0]?.count ?? 0;
}

export async function deactivatePastShows() {
  const today = format(new Date(), 'yyyy-MM-dd');
  // Deactivate shows where the effective end date (endDate or startDate) is before today
  const result = await db.update(shows)
    .set({ isActive: false, updatedAt: new Date().toISOString() })
    .where(and(
      eq(shows.isActive, true),
      or(
        // Multi-day shows: endDate < today
        and(sql`${shows.endDate} IS NOT NULL`, lt(shows.endDate, today)),
        // Single-day shows: startDate < today
        and(isNull(shows.endDate), lt(shows.startDate, today)),
      ),
    ));
  return result;
}
