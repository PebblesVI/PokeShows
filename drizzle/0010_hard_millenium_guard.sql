CREATE TABLE `affiliate_clicks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_name` text,
	`card_id` text,
	`destination` text NOT NULL,
	`source_page` text NOT NULL,
	`custom_id` text,
	`clicked_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ac_destination_idx` ON `affiliate_clicks` (`destination`);--> statement-breakpoint
CREATE INDEX `ac_source_idx` ON `affiliate_clicks` (`source_page`);--> statement-breakpoint
CREATE INDEX `ac_clicked_at_idx` ON `affiliate_clicks` (`clicked_at`);--> statement-breakpoint
CREATE TABLE `collector_achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`achievement_id` text NOT NULL,
	`unlocked_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ca_email_achievement_idx` ON `collector_achievements` (`email`,`achievement_id`);--> statement-breakpoint
CREATE INDEX `ca_email_idx` ON `collector_achievements` (`email`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`stripe_session_id` text,
	`stripe_payment_intent_id` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'usd' NOT NULL,
	`type` text NOT NULL,
	`metadata` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_stripe_session_id_unique` ON `payments` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `payments_email_idx` ON `payments` (`email`);--> statement-breakpoint
CREATE INDEX `payments_type_idx` ON `payments` (`type`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE TABLE `pro_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`plan` text DEFAULT 'monthly' NOT NULL,
	`current_period_end` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pro_subscriptions_email_unique` ON `pro_subscriptions` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `pro_email_idx` ON `pro_subscriptions` (`email`);