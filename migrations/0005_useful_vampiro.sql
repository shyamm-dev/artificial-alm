DROP INDEX `idx_jira_project_resourceId`;--> statement-breakpoint
ALTER TABLE `jira_project` ADD `imported` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_jira_project_resource_id` ON `jira_project` (`resource_id`);--> statement-breakpoint
DROP INDEX `idx_jira_project_issue_type_projectId`;--> statement-breakpoint
CREATE INDEX `idx_jira_project_issue_type_project_id` ON `jira_project_issue_type` (`project_id`);