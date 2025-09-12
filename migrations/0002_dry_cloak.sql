CREATE INDEX `idx_resource_cloudId` ON `atlassian_resource` (`cloud_id`);--> statement-breakpoint
CREATE INDEX `idx_userAccess_userId` ON `user_atlassian_project_access` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_userAccess_cloudId` ON `user_atlassian_project_access` (`cloud_id`);--> statement-breakpoint
CREATE INDEX `idx_userAccess_projectId` ON `user_atlassian_project_access` (`project_id`);