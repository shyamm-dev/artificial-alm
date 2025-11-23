CREATE TABLE `project_custom_rule` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`project_type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`severity` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_project_custom_rule_project` ON `project_custom_rule` (`project_id`,`project_type`);--> statement-breakpoint
CREATE INDEX `idx_project_custom_rule_created_by` ON `project_custom_rule` (`created_by`);