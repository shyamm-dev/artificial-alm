import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { atlassianResource } from "./atlassian-resource-schema";
import { timestamps } from "../helper/timestamp-helper";

export const jiraProject = sqliteTable("jira_project", {
  id: text("id").primaryKey(), // Jira's project id
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  self: text("self").notNull(),
  projectTypeKey: text("project_type_key").notNull(),
  simplified: integer("simplified", { mode: "boolean" }).notNull(),
  style: text("style"),
  isPrivate: integer("is_private", { mode: "boolean" }).notNull(),

  // Inlined Avatars
  avatar48: text("avatar_48"),
  avatar32: text("avatar_32"),
  avatar24: text("avatar_24"),
  avatar16: text("avatar_16"),

  // Inlined Insight
  totalIssueCount: integer("total_issue_count"),
  lastIssueUpdateTime: text("last_issue_update_time"),

  // FK to Atlassian Resource (site)
  resourceId: integer("resource_id").notNull().references(() => atlassianResource.id, { onDelete: "cascade" }),

  ...timestamps
},
  (table) => [
    index("idx_jiraProject_resourceId").on(table.resourceId),
  ]
);

export const jiraProjectIssueType = sqliteTable("jira_project_issue_type", {
  id: text("id").primaryKey(), // Jira project issueType id
  projectId: text("project_id").notNull().references(() => jiraProject.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  subtask: integer("subtask", { mode: "boolean" }).notNull(),
  avatarId: integer("avatar_id"),
  hierarchyLevel: integer("hierarchy_level"),
  self: text("self").notNull(),

  ...timestamps
},
  (table) => [
    index("idx_jiraProjectIssueType_projectId").on(table.projectId),
  ]
);
