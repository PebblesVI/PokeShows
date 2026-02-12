CREATE TABLE `show_reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`show_slug` text NOT NULL,
	`remind_before` text NOT NULL,
	`sent` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reminders_sent_slug_idx` ON `show_reminders` (`sent`,`show_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `reminders_email_show_idx` ON `show_reminders` (`email`,`show_slug`);--> statement-breakpoint
ALTER TABLE `shows` ADD `latitude` real;--> statement-breakpoint
ALTER TABLE `shows` ADD `longitude` real;