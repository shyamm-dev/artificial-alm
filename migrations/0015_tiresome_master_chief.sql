CREATE TABLE `standalone_scheduled_job` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`created_by_user_id` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `standalone_project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_standalone_scheduled_job_project_id` ON `standalone_scheduled_job` (`project_id`);--> statement-breakpoint
CREATE TABLE `standalone_scheduled_job_requirement` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reason` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `standalone_scheduled_job`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_standalone_scheduled_job_requirement_job_id` ON `standalone_scheduled_job_requirement` (`job_id`);--> statement-breakpoint
CREATE TABLE `standalone_scheduled_job_requirement_test_case` (
	`id` text PRIMARY KEY NOT NULL,
	`requirement_id` text NOT NULL,
	`summary` text NOT NULL,
	`description` text NOT NULL,
	`generated_by` text DEFAULT 'ai' NOT NULL,
	`modified_by_user_id` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`requirement_id`) REFERENCES `standalone_scheduled_job_requirement`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`modified_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_standalone_scheduled_job_requirement_test_case_requirement_id` ON `standalone_scheduled_job_requirement_test_case` (`requirement_id`);--> statement-breakpoint
CREATE INDEX `idx_standalone_scheduled_job_requirement_test_case_modified_by` ON `standalone_scheduled_job_requirement_test_case` (`modified_by_user_id`);