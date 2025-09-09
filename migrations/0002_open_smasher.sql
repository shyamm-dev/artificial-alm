CREATE TABLE `jira_project` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`self` text NOT NULL,
	`project_type_key` text NOT NULL,
	`simplified` integer NOT NULL,
	`style` text,
	`is_private` integer NOT NULL,
	`avatar_48` text,
	`avatar_32` text,
	`avatar_24` text,
	`avatar_16` text,
	`total_issue_count` integer,
	`last_issue_update_time` text,
	`resource_id` integer NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`resource_id`) REFERENCES `atlassian_resource`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_jiraProject_resourceId` ON `jira_project` (`resource_id`);--> statement-breakpoint
CREATE TABLE `jira_project_issue_type` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon_url` text,
	`subtask` integer NOT NULL,
	`avatar_id` integer,
	`hierarchy_level` integer,
	`self` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `jira_project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_jiraProjectIssueType_projectId` ON `jira_project_issue_type` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_atlassianResource_userId` ON `atlassian_resource` (`user_id`);