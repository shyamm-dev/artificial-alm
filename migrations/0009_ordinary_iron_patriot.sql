PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_scheduled_job_issue_test_case` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_id` text NOT NULL,
	`summary` text NOT NULL,
	`description` text NOT NULL,
	`linked_to` text,
	`modified_by_user_id` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `scheduled_job_issue`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`modified_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_scheduled_job_issue_test_case`("id", "issue_id", "summary", "description", "linked_to", "modified_by_user_id", "created_at", "updated_at") SELECT "id", "issue_id", "summary", "description", "linked_to", "modified_by_user_id", "created_at", "updated_at" FROM `scheduled_job_issue_test_case`;--> statement-breakpoint
DROP TABLE `scheduled_job_issue_test_case`;--> statement-breakpoint
ALTER TABLE `__new_scheduled_job_issue_test_case` RENAME TO `scheduled_job_issue_test_case`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_test_case_issue_id` ON `scheduled_job_issue_test_case` (`issue_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_test_case_modified_by` ON `scheduled_job_issue_test_case` (`modified_by_user_id`);