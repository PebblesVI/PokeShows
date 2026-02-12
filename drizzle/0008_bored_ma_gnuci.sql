CREATE TABLE `deal_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`unsubscribed` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deal_subscribers_email_unique` ON `deal_subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `grading_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`card_count` integer NOT NULL,
	`estimated_value` text NOT NULL,
	`preferred_service` text,
	`turnaround_preference` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sponsor_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`business_name` text,
	`sponsor_type` text NOT NULL,
	`message` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vendor_show_presence` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vendor_id` integer NOT NULL,
	`show_slug` text NOT NULL,
	`is_sponsored` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vsp_vendor_show_idx` ON `vendor_show_presence` (`vendor_id`,`show_slug`);--> statement-breakpoint
CREATE INDEX `vsp_show_slug_idx` ON `vendor_show_presence` (`show_slug`);--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`website` text,
	`description` text,
	`state` text NOT NULL,
	`city` text,
	`specialties` text,
	`is_verified` integer DEFAULT false,
	`is_featured` integer DEFAULT false,
	`featured_until` text,
	`show_slugs` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendors_slug_unique` ON `vendors` (`slug`);--> statement-breakpoint
CREATE INDEX `vendors_state_idx` ON `vendors` (`state`);--> statement-breakpoint
CREATE INDEX `vendors_featured_idx` ON `vendors` (`is_featured`);--> statement-breakpoint
CREATE TABLE `wishlist_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`card_ids` text NOT NULL,
	`alert_type` text DEFAULT 'price_drop' NOT NULL,
	`threshold_percent` integer DEFAULT 10 NOT NULL,
	`last_checked_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlist_alerts_email_idx` ON `wishlist_alerts` (`email`);--> statement-breakpoint
ALTER TABLE `card_of_the_day` ADD `is_sponsored` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `card_of_the_day` ADD `sponsor_name` text;--> statement-breakpoint
ALTER TABLE `card_of_the_day` ADD `sponsor_url` text;