CREATE TABLE `digest_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`state` text,
	`metros` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `digest_preferences_email_unique` ON `digest_preferences` (`email`);--> statement-breakpoint
CREATE TABLE `organizer_follows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`organizer_name` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `org_follows_email_org_idx` ON `organizer_follows` (`email`,`organizer_name`);--> statement-breakpoint
CREATE INDEX `org_follows_organizer_idx` ON `organizer_follows` (`organizer_name`);--> statement-breakpoint
CREATE TABLE `price_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`pokemon_tcg_id` text NOT NULL,
	`card_name` text NOT NULL,
	`target_price` real NOT NULL,
	`sent` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `price_alerts_email_card_idx` ON `price_alerts` (`email`,`pokemon_tcg_id`);--> statement-breakpoint
CREATE INDEX `price_alerts_sent_idx` ON `price_alerts` (`sent`);--> statement-breakpoint
CREATE TABLE `show_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`state` text NOT NULL,
	`city` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `show_alerts_email_state_city_idx` ON `show_alerts` (`email`,`state`,`city`);--> statement-breakpoint
CREATE INDEX `show_alerts_state_idx` ON `show_alerts` (`state`);--> statement-breakpoint
CREATE TABLE `show_checkins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`show_slug` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkins_email_show_idx` ON `show_checkins` (`email`,`show_slug`);--> statement-breakpoint
CREATE INDEX `checkins_show_slug_idx` ON `show_checkins` (`show_slug`);--> statement-breakpoint
CREATE TABLE `show_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`show_slug` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`rating` integer NOT NULL,
	`text` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reviews_show_slug_idx` ON `show_reviews` (`show_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_email_show_idx` ON `show_reviews` (`email`,`show_slug`);