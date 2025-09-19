ALTER TABLE `scheduled_job_issue_test_case` ADD `generated_by` text DEFAULT 'ai' NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_job_issue_test_case` DROP COLUMN `linked_to`;