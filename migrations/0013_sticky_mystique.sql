PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_scheduled_job` (
	`id` text PRIMARY KEY NOT NULL,
	`cloud_id` text NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`created_by_user_id` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `jira_project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_scheduled_job`("id", "cloud_id", "project_id", "name", "created_by_user_id", "created_at", "updated_at") SELECT "id", "cloud_id", "project_id", "name", "created_by_user_id", "created_at", "updated_at" FROM `scheduled_job`;--> statement-breakpoint
DROP TABLE `scheduled_job`;--> statement-breakpoint
ALTER TABLE `__new_scheduled_job` RENAME TO `scheduled_job`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_cloud_id` ON `scheduled_job` (`cloud_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_project_id` ON `scheduled_job` (`project_id`);