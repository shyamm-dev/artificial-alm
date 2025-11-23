CREATE TABLE `custom_rule_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `custom_rule_tag_name_unique` ON `custom_rule_tag` (`name`);--> statement-breakpoint
CREATE INDEX `idx_custom_rule_tag_name` ON `custom_rule_tag` (`name`);