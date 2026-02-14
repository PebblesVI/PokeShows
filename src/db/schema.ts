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
  isSponsored: integer('is_sponsored', { mode: 'boolean' }).default(false),
  sponsorName: text('sponsor_name'),
  sponsorUrl: text('sponsor_url'),
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
  featuredUntil: text('featured_until'), // ISO date — null means not time-limited
  showSlugs: text('show_slugs'), // JSON array of show slugs this vendor attends
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index('vendors_state_idx').on(table.state),
  index('vendors_featured_idx').on(table.isFeatured),
]);

export const vendorShowPresence = sqliteTable('vendor_show_presence', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vendorId: integer('vendor_id').notNull(),
  showSlug: text('show_slug').notNull(),
  isSponsored: integer('is_sponsored', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('vsp_vendor_show_idx').on(table.vendorId, table.showSlug),
  index('vsp_show_slug_idx').on(table.showSlug),
]);

export const gradingLeads = sqliteTable('grading_leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  name: text('name').notNull(),
  cardCount: integer('card_count').notNull(),
  estimatedValue: text('estimated_value').notNull(),
  preferredService: text('preferred_service'), // PSA, CGC, BGS, ACE, or null (no preference)
  turnaroundPreference: text('turnaround_preference'), // economy, standard, express
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const wishlistAlerts = sqliteTable('wishlist_alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  cardIds: text('card_ids').notNull(), // JSON array of pokemonTcgIds
  alertType: text('alert_type').default('price_drop').notNull(), // price_drop
  thresholdPercent: integer('threshold_percent').default(10).notNull(), // e.g. 10 = notify on 10%+ drop
  lastCheckedAt: text('last_checked_at'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('wishlist_alerts_email_idx').on(table.email),
]);

export const sponsorRequests = sqliteTable('sponsor_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  businessName: text('business_name'),
  sponsorType: text('sponsor_type').notNull(), // cotd, vendor, general
  message: text('message'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const collectorProfiles = sqliteTable('collector_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  slug: text('slug').notNull().unique(),
  bio: text('bio'),
  favoriteSet: text('favorite_set'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('cp_email_idx').on(table.email),
  uniqueIndex('cp_slug_idx').on(table.slug),
]);

export const collectionCards = sqliteTable('collection_cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  pokemonTcgId: text('pokemon_tcg_id').notNull(),
  cardName: text('card_name').notNull(),
  setName: text('set_name').notNull(),
  setId: text('set_id').notNull(),
  imageSmall: text('image_small').notNull(),
  rarity: text('rarity'),
  variant: text('variant'),
  pricePaid: real('price_paid'),
  forTrade: integer('for_trade', { mode: 'boolean' }).default(false),
  addedAt: text('added_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index('cc_email_idx').on(table.email),
  index('cc_set_id_idx').on(table.email, table.setId),
  uniqueIndex('cc_email_card_idx').on(table.email, table.pokemonTcgId),
]);

export const showFeedPosts = sqliteTable('show_feed_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  showSlug: text('show_slug').notNull(),
  type: text('type').notNull(), // going, bought, comment
  text: text('text'),
  cardName: text('card_name'),
  pricePaid: real('price_paid'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index('sfp_show_slug_idx').on(table.showSlug),
  index('sfp_created_idx').on(table.showSlug, table.createdAt),
]);

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  stripeSessionId: text('stripe_session_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  amount: integer('amount').notNull(), // cents
  currency: text('currency').default('usd').notNull(),
  type: text('type').notNull(), // vendor_featured, cotd_sponsorship, show_promotion
  metadata: text('metadata'), // JSON — showSlug, vendorId, sponsorDate, etc.
  status: text('status').default('pending').notNull(), // pending, completed, failed
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index('payments_email_idx').on(table.email),
  index('payments_type_idx').on(table.type),
  index('payments_status_idx').on(table.status),
]);

export const proSubscriptions = sqliteTable('pro_subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status').default('active').notNull(), // active, canceled, past_due
  plan: text('plan').default('monthly').notNull(),
  currentPeriodEnd: text('current_period_end'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('pro_email_idx').on(table.email),
]);

export const affiliateClicks = sqliteTable('affiliate_clicks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardName: text('card_name'),
  cardId: text('card_id'),
  destination: text('destination').notNull(), // ebay, tcgplayer
  sourcePage: text('source_page').notNull(),
  customId: text('custom_id'),
  clickedAt: text('clicked_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index('ac_destination_idx').on(table.destination),
  index('ac_source_idx').on(table.sourcePage),
  index('ac_clicked_at_idx').on(table.clickedAt),
]);

export const collectorAchievements = sqliteTable('collector_achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  achievementId: text('achievement_id').notNull(),
  unlockedAt: text('unlocked_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('ca_email_achievement_idx').on(table.email, table.achievementId),
  index('ca_email_idx').on(table.email),
]);

export const setReleaseAlerts = sqliteTable('set_release_alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  setId: text('set_id').notNull(),
  setName: text('set_name').notNull(),
  releaseDate: text('release_date'),
  sent: integer('sent', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex('sra_email_set_idx').on(table.email, table.setId),
  index('sra_set_idx').on(table.setId),
]);
