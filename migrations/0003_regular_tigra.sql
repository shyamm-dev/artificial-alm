DROP INDEX `idx_atlassianResource_userId`;--> statement-breakpoint
CREATE INDEX `idx_atlassian_resource_userId` ON `atlassian_resource` (`user_id`);--> statement-breakpoint
DROP INDEX `idx_jiraProject_resourceId`;--> statement-breakpoint
CREATE INDEX `idx_jira_project_resourceId` ON `jira_project` (`resource_id`);--> statement-breakpoint
DROP INDEX `idx_jiraProjectIssueType_projectId`;--> statement-breakpoint
CREATE INDEX `idx_jira_project_issue_type_projectId` ON `jira_project_issue_type` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_account_user_id` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_account_provider_id` ON `account` (`provider_id`);--> statement-breakpoint
CREATE INDEX `idx_session_user_id` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_verification_identifier` ON `verification` (`identifier`);