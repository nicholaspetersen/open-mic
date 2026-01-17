CREATE TABLE `devices` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`venue` text,
	`code` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`allow_multiple_signups` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_code_unique` ON `events` (`code`);--> statement-breakpoint
CREATE TABLE `signups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`device_id` text NOT NULL,
	`performer_name` text NOT NULL,
	`type` text NOT NULL,
	`song_id` integer,
	`request_text` text,
	`request_status` text,
	`decline_reason` text,
	`position` integer NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`notes` text,
	`host_notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`key` text,
	`tempo` text,
	`notes` text,
	`difficulty` text DEFAULT 'medium',
	`tags` text,
	`last_played_at` text,
	`play_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
