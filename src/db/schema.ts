import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const shows = sqliteTable('shows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  venueName: text('venue_name'),
  address: text('address'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  stateFullName: text('state_full_name'),
  zipCode: text('zip_code'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  admissionPrice: text('admission_price'),
  organizerName: text('organizer_name'),
  websiteUrl: text('website_url'),
  imageUrl: text('image_url'),
  eventType: text('event_type').default('card_show'),
  isPokemonSpecific: integer('is_pokemon_specific', { mode: 'boolean' }).default(false),
  sourceId: text('source_id'),
  sourceName: text('source_name').notNull(),
  sourceUrl: text('source_url'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  lastScrapedAt: text('last_scraped_at'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
}, (table) => [
  index('shows_state_idx').on(table.state),
  index('shows_start_date_idx').on(table.startDate),
  index('shows_state_start_date_idx').on(table.state, table.startDate),
  uniqueIndex('shows_source_dedup_idx').on(table.sourceName, table.sourceId),
]);

export const cardOfTheDay = sqliteTable('card_of_the_day', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  featuredDate: text('featured_date').notNull().unique(),
  pokemonTcgId: text('pokemon_tcg_id').notNull(),
  cardName: text('card_name').notNull(),
  setName: text('set_name').notNull(),
  setSeries: text('set_series'),
  rarity: text('rarity'),
  artist: text('artist'),
  cardNumber: text('card_number'),
  types: text('types'),
  hp: text('hp'),
  flavorText: text('flavor_text'),
  imageSmall: text('image_small').notNull(),
  imageLarge: text('image_large').notNull(),
  tcgPlayerUrl: text('tcg_player_url'),
  tcgPlayerPrice: real('tcg_player_price'),
  priceLow: real('price_low'),
  priceMid: real('price_mid'),
  priceHigh: real('price_high'),
  priceDirectLow: real('price_direct_low'),
  priceVariant: text('price_variant'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('cotd_featured_date_idx').on(table.featuredDate),
]);

export const newsletterEmails = sqliteTable('newsletter_emails', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  subscribedAt: text('subscribed_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const ebayListings = sqliteTable('ebay_listings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  searchQuery: text('search_query').notNull(),
  ebayItemId: text('ebay_item_id').notNull(),
  title: text('title').notNull(),
  price: real('price'),
  currency: text('currency').default('USD'),
  imageUrl: text('image_url'),
  itemUrl: text('item_url').notNull(),
  condition: text('condition'),
  seller: text('seller'),
  listingType: text('listing_type'),
  endTime: text('end_time'),
  categorySlug: text('category_slug'),
  cardSlug: text('card_slug'),
  fetchedAt: text('fetched_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index('listings_search_query_idx').on(table.searchQuery),
  index('listings_category_slug_idx').on(table.categorySlug),
  index('listings_card_slug_idx').on(table.cardSlug),
  index('listings_fetched_at_idx').on(table.fetchedAt),
  uniqueIndex('listings_item_dedup_idx').on(table.ebayItemId),
]);

export const scraperRuns = sqliteTable('scraper_runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scraperName: text('scraper_name').notNull(),
  status: text('status').notNull(),
  showsFound: integer('shows_found').default(0),
  showsCreated: integer('shows_created').default(0),
  showsUpdated: integer('shows_updated').default(0),
  errorMessage: text('error_message'),
  durationMs: integer('duration_ms'),
  runAt: text('run_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const showReminders = sqliteTable('show_reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  showSlug: text('show_slug').notNull(),
  remindBefore: text('remind_before').notNull(), // "1d" | "3d" | "7d"
  sent: integer('sent', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index('reminders_sent_slug_idx').on(table.sent, table.showSlug),
  uniqueIndex('reminders_email_show_idx').on(table.email, table.showSlug),
]);

export const cardPriceHistory = sqliteTable('card_price_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pokemonTcgId: text('pokemon_tcg_id').notNull(),
  variant: text('variant'),
  priceLow: real('price_low'),
  priceMid: real('price_mid'),
  priceHigh: real('price_high'),
  priceMarket: real('price_market'),
  priceDirectLow: real('price_direct_low'),
  recordedDate: text('recorded_date').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index('cph_card_date_idx').on(table.pokemonTcgId, table.recordedDate),
  uniqueIndex('cph_card_date_unique_idx').on(table.pokemonTcgId, table.recordedDate),
]);

export const showCheckins = sqliteTable('show_checkins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  showSlug: text('show_slug').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('checkins_email_show_idx').on(table.email, table.showSlug),
  index('checkins_show_slug_idx').on(table.showSlug),
]);

export const priceAlerts = sqliteTable('price_alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  pokemonTcgId: text('pokemon_tcg_id').notNull(),
  cardName: text('card_name').notNull(),
  targetPrice: real('target_price').notNull(),
  sent: integer('sent', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('price_alerts_email_card_idx').on(table.email, table.pokemonTcgId),
  index('price_alerts_sent_idx').on(table.sent),
]);

export const showAlerts = sqliteTable('show_alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  state: text('state').notNull(),
  city: text('city'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('show_alerts_email_state_city_idx').on(table.email, table.state, table.city),
  index('show_alerts_state_idx').on(table.state),
]);

export const organizerFollows = sqliteTable('organizer_follows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  organizerName: text('organizer_name').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('org_follows_email_org_idx').on(table.email, table.organizerName),
  index('org_follows_organizer_idx').on(table.organizerName),
]);

export const showReviews = sqliteTable('show_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  showSlug: text('show_slug').notNull(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  rating: integer('rating').notNull(),
  text: text('text'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index('reviews_show_slug_idx').on(table.showSlug),
  uniqueIndex('reviews_email_show_idx').on(table.email, table.showSlug),
]);

export const digestPreferences = sqliteTable('digest_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  state: text('state'),
  metros: text('metros'), // JSON array of metro area slugs
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const dealSubscribers = sqliteTable('deal_subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  unsubscribed: integer('unsubscribed', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const vendors = sqliteTable('vendors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  website: text('website'),
  description: text('description'),
  state: text('state').notNull(),
  city: text('city'),
  specialties: text('specialties'), // JSON array: ["vintage", "graded", "japanese"]
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index('vendors_state_idx').on(table.state),
  index('vendors_featured_idx').on(table.isFeatured),
]);
