CREATE TABLE `project_metadata` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`imported` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `jira_project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_metadata_project_id_unique` ON `project_metadata` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_project_metadata_project_id` ON `project_metadata` (`project_id`);--> statement-breakpoint
ALTER TABLE `jira_project` DROP COLUMN `imported`;