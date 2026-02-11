CREATE TABLE `card_of_the_day` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`featured_date` text NOT NULL,
	`pokemon_tcg_id` text NOT NULL,
	`card_name` text NOT NULL,
	`set_name` text NOT NULL,
	`set_series` text,
	`rarity` text,
	`artist` text,
	`card_number` text,
	`types` text,
	`hp` text,
	`flavor_text` text,
	`image_small` text NOT NULL,
	`image_large` text NOT NULL,
	`tcg_player_url` text,
	`tcg_player_price` real,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `card_of_the_day_featured_date_unique` ON `card_of_the_day` (`featured_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `cotd_featured_date_idx` ON `card_of_the_day` (`featured_date`);--> statement-breakpoint
CREATE TABLE `scraper_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scraper_name` text NOT NULL,
	`status` text NOT NULL,
	`shows_found` integer DEFAULT 0,
	`shows_created` integer DEFAULT 0,
	`shows_updated` integer DEFAULT 0,
	`error_message` text,
	`duration_ms` integer,
	`run_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`venue_name` text,
	`address` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`state_full_name` text,
	`zip_code` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`start_time` text,
	`end_time` text,
	`admission_price` text,
	`organizer_name` text,
	`website_url` text,
	`image_url` text,
	`event_type` text DEFAULT 'card_show',
	`is_pokemon_specific` integer DEFAULT false,
	`source_id` text,
	`source_name` text NOT NULL,
	`source_url` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`last_scraped_at` text,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shows_slug_unique` ON `shows` (`slug`);--> statement-breakpoint
CREATE INDEX `shows_state_idx` ON `shows` (`state`);--> statement-breakpoint
CREATE INDEX `shows_start_date_idx` ON `shows` (`start_date`);--> statement-breakpoint
CREATE INDEX `shows_state_start_date_idx` ON `shows` (`state`,`start_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `shows_source_dedup_idx` ON `shows` (`source_name`,`source_id`);