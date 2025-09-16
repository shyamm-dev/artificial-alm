DROP INDEX "idx_resource_cloudId";--> statement-breakpoint
DROP INDEX "idx_account_user_id";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "idx_session_user_id";--> statement-breakpoint
DROP INDEX "idx_session_token";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "idx_user_email";--> statement-breakpoint
DROP INDEX "idx_verification_identifier";--> statement-breakpoint
DROP INDEX "idx_jira_project_cloud_id";--> statement-breakpoint
DROP INDEX "idx_jira_project_issue_type_project_id";--> statement-breakpoint
DROP INDEX "idx_userAccess_userId";--> statement-breakpoint
DROP INDEX "idx_userAccess_cloudId";--> statement-breakpoint
DROP INDEX "idx_userAccess_projectId";--> statement-breakpoint
DROP INDEX "idx_scheduled_job_cloud_id";--> statement-breakpoint
DROP INDEX "idx_scheduled_job_project_id";--> statement-breakpoint
DROP INDEX "idx_scheduled_job_issue_job_id";--> statement-breakpoint
DROP INDEX "idx_scheduled_job_issue_issue_id";--> statement-breakpoint
DROP INDEX "uq_job_issue";--> statement-breakpoint
DROP INDEX "idx_scheduled_job_issue_test_case_issue_id";--> statement-breakpoint
DROP INDEX "idx_scheduled_job_issue_test_case_modified_by";--> statement-breakpoint
ALTER TABLE `scheduled_job_issue` ALTER COLUMN "description" TO "description" text;--> statement-breakpoint
CREATE INDEX `idx_resource_cloudId` ON `atlassian_resource` (`cloud_id`);--> statement-breakpoint
CREATE INDEX `idx_account_user_id` ON `account` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `idx_session_user_id` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_session_token` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `idx_user_email` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `idx_verification_identifier` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `idx_jira_project_cloud_id` ON `jira_project` (`cloud_id`);--> statement-breakpoint
CREATE INDEX `idx_jira_project_issue_type_project_id` ON `jira_project_issue_type` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_userAccess_userId` ON `user_atlassian_project_access` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_userAccess_cloudId` ON `user_atlassian_project_access` (`cloud_id`);--> statement-breakpoint
CREATE INDEX `idx_userAccess_projectId` ON `user_atlassian_project_access` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_cloud_id` ON `scheduled_job` (`cloud_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_project_id` ON `scheduled_job` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_job_id` ON `scheduled_job_issue` (`job_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_issue_id` ON `scheduled_job_issue` (`issue_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_job_issue` ON `scheduled_job_issue` (`job_id`,`issue_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_test_case_issue_id` ON `scheduled_job_issue_test_case` (`issue_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_job_issue_test_case_modified_by` ON `scheduled_job_issue_test_case` (`modified_by_user_id`);