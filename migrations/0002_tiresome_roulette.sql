CREATE TABLE `scheduled_job` (
	`id` text PRIMARY KEY NOT NULL,
	`cloud_id` text NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`created_by_user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `jira_project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_cloud_id` ON `scheduled_job` (`cloud_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_project_id` ON `scheduled_job` (`project_id`);--> statement-breakpoint
CREATE TABLE `scheduled_job_issue` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`issue_id` text NOT NULL,
	`issue_key` text NOT NULL,
	`summary` text NOT NULL,
	`description` text,
	`issue_type_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`progress` integer DEFAULT 0,
	`assignee` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `scheduled_job`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`issue_type_id`) REFERENCES `jira_project_issue_type`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_job_id` ON `scheduled_job_issue` (`job_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_issue_id` ON `scheduled_job_issue` (`issue_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_job_issue` ON `scheduled_job_issue` (`job_id`,`issue_id`);--> statement-breakpoint
CREATE TABLE `scheduled_job_issue_test_case` (
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
CREATE INDEX `idx_scheduled_job_issue_test_case_issue_id` ON `scheduled_job_issue_test_case` (`issue_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_test_case_modified_by` ON `scheduled_job_issue_test_case` (`modified_by_user_id`);