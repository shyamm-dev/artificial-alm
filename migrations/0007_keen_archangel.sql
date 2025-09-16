PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_scheduled_job` (
	`id` text PRIMARY KEY NOT NULL,
	`cloud_id` text NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`created_by_user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `jira_project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_scheduled_job`("id", "cloud_id", "project_id", "name", "created_by_user_id", "created_at", "updated_at") SELECT "id", "cloud_id", "project_id", "name", "created_by_user_id", "created_at", "updated_at" FROM `scheduled_job`;--> statement-breakpoint
DROP TABLE `scheduled_job`;--> statement-breakpoint
ALTER TABLE `__new_scheduled_job` RENAME TO `scheduled_job`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_cloud_id` ON `scheduled_job` (`cloud_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_project_id` ON `scheduled_job` (`project_id`);--> statement-breakpoint
CREATE TABLE `__new_scheduled_job_issue` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`issue_id` text NOT NULL,
	`issue_key` text NOT NULL,
	`summary` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`issue_type_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `scheduled_job`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`issue_type_id`) REFERENCES `jira_project_issue_type`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_scheduled_job_issue`("id", "job_id", "issue_id", "issue_key", "summary", "description", "status", "issue_type_id", "created_at", "updated_at") SELECT "id", "job_id", "issue_id", "issue_key", "summary", "description", "status", "issue_type_id", "created_at", "updated_at" FROM `scheduled_job_issue`;--> statement-breakpoint
DROP TABLE `scheduled_job_issue`;--> statement-breakpoint
ALTER TABLE `__new_scheduled_job_issue` RENAME TO `scheduled_job_issue`;--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_job_id` ON `scheduled_job_issue` (`job_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_issue_id` ON `scheduled_job_issue` (`issue_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_job_issue` ON `scheduled_job_issue` (`job_id`,`issue_id`);--> statement-breakpoint
CREATE TABLE `__new_scheduled_job_issue_test_case` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_id` text NOT NULL,
	`summary` text NOT NULL,
	`description` text NOT NULL,
	`linked_to` text,
	`modified_by_user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `scheduled_job_issue`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`modified_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_scheduled_job_issue_test_case`("id", "issue_id", "summary", "description", "linked_to", "modified_by_user_id", "created_at", "updated_at") SELECT "id", "issue_id", "summary", "description", "linked_to", "modified_by_user_id", "created_at", "updated_at" FROM `scheduled_job_issue_test_case`;--> statement-breakpoint
DROP TABLE `scheduled_job_issue_test_case`;--> statement-breakpoint
ALTER TABLE `__new_scheduled_job_issue_test_case` RENAME TO `scheduled_job_issue_test_case`;--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_test_case_issue_id` ON `scheduled_job_issue_test_case` (`issue_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_test_case_modified_by` ON `scheduled_job_issue_test_case` (`modified_by_user_id`);