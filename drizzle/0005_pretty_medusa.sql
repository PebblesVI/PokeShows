CREATE TABLE `card_price_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pokemon_tcg_id` text NOT NULL,
	`variant` text,
	`price_low` real,
	`price_mid` real,
	`price_high` real,
	`price_market` real,
	`price_direct_low` real,
	`recorded_date` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cph_card_date_idx` ON `card_price_history` (`pokemon_tcg_id`,`recorded_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `cph_card_date_unique_idx` ON `card_price_history` (`pokemon_tcg_id`,`recorded_date`);