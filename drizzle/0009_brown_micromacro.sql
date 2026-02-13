CREATE TABLE `collection_cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`pokemon_tcg_id` text NOT NULL,
	`card_name` text NOT NULL,
	`set_name` text NOT NULL,
	`set_id` text NOT NULL,
	`image_small` text NOT NULL,
	`rarity` text,
	`variant` text,
	`price_paid` real,
	`for_trade` integer DEFAULT false,
	`added_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cc_email_idx` ON `collection_cards` (`email`);--> statement-breakpoint
CREATE INDEX `cc_set_id_idx` ON `collection_cards` (`email`,`set_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cc_email_card_idx` ON `collection_cards` (`email`,`pokemon_tcg_id`);--> statement-breakpoint
CREATE TABLE `collector_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`slug` text NOT NULL,
	`bio` text,
	`favorite_set` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collector_profiles_email_unique` ON `collector_profiles` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `collector_profiles_slug_unique` ON `collector_profiles` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `cp_email_idx` ON `collector_profiles` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `cp_slug_idx` ON `collector_profiles` (`slug`);--> statement-breakpoint
CREATE TABLE `set_release_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`set_id` text NOT NULL,
	`set_name` text NOT NULL,
	`release_date` text,
	`sent` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sra_email_set_idx` ON `set_release_alerts` (`email`,`set_id`);--> statement-breakpoint
CREATE INDEX `sra_set_idx` ON `set_release_alerts` (`set_id`);--> statement-breakpoint
CREATE TABLE `show_feed_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`show_slug` text NOT NULL,
	`type` text NOT NULL,
	`text` text,
	`card_name` text,
	`price_paid` real,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sfp_show_slug_idx` ON `show_feed_posts` (`show_slug`);--> statement-breakpoint
CREATE INDEX `sfp_created_idx` ON `show_feed_posts` (`show_slug`,`created_at`);