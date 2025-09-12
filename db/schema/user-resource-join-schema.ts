import { sqliteTable, text, primaryKey, index } from "drizzle-orm/sqlite-core";
import { atlassianResource } from "./atlassian-resource-schema";
import { user } from "@/auth-schema";
import { timestamps } from "../helper/timestamp-helper";
import { jiraProject } from "./jira-project-schema";

export const userAtlassianProjectAccess = sqliteTable("user_atlassian_project_access", {

  // FKs to track which user has access to which resource and project under that resource.
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  cloudId: text("cloud_id").notNull().references(() => atlassianResource.cloudId, { onDelete: "cascade" }),

  // can be null. if user has no projects under a resource
  projectId: text("project_id").references(() => jiraProject.id, { onDelete: "cascade" }),

  ...timestamps
},
  (table) => [
    primaryKey({ columns: [table.userId, table.cloudId, table.projectId] }),
    index("idx_userAccess_userId").on(table.userId),
    index("idx_userAccess_cloudId").on(table.cloudId),
    index("idx_userAccess_projectId").on(table.projectId),
  ]
);
