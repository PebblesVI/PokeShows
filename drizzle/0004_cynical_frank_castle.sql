CREATE TABLE `ebay_listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`search_query` text NOT NULL,
	`ebay_item_id` text NOT NULL,
	`title` text NOT NULL,
	`price` real,
	`currency` text DEFAULT 'USD',
	`image_url` text,
	`item_url` text NOT NULL,
	`condition` text,
	`seller` text,
	`listing_type` text,
	`end_time` text,
	`category_slug` text,
	`card_slug` text,
	`fetched_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `listings_search_query_idx` ON `ebay_listings` (`search_query`);--> statement-breakpoint
CREATE INDEX `listings_category_slug_idx` ON `ebay_listings` (`category_slug`);--> statement-breakpoint
CREATE INDEX `listings_card_slug_idx` ON `ebay_listings` (`card_slug`);--> statement-breakpoint
CREATE INDEX `listings_fetched_at_idx` ON `ebay_listings` (`fetched_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `listings_item_dedup_idx` ON `ebay_listings` (`ebay_item_id`);