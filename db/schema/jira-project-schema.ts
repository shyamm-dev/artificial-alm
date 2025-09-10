import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { atlassianResource } from "./atlassian-resource-schema";
import { timestamps } from "../helper/timestamp-helper";
import { ComplianceFramework } from "@/constants/compliance";

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

  // FK to Atlassian Resource (site)
  resourceId: integer("resource_id").notNull().references(() => atlassianResource.id, { onDelete: "cascade" }),

  ...timestamps
},
  (table) => [index("idx_jira_project_resource_id").on(table.resourceId)]
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
  (table) => [index("idx_jira_project_issue_type_project_id").on(table.projectId)]
);

export const jiraProjectCompliance = sqliteTable("jira_project_compliance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: text("project_id").notNull().references(() => jiraProject.id, { onDelete: "cascade" }),
  framework: text("framework").$type<ComplianceFramework>().notNull(),

  ...timestamps
},
  (table) => [index("idx_project_compliance_project_id").on(table.projectId)]
);

export const projectMetadata = sqliteTable("project_metadata", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: text("project_id").unique().notNull().references(() => jiraProject.id, { onDelete: "cascade" }),
  imported: integer("imported", { mode: "boolean" }).default(false).notNull(),

  ...timestamps
},
  (table) => [
    index("idx_project_metadata_project_id").on(table.projectId)
  ]
);
