import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { atlassianResource } from "./atlassian-resource-schema";
import { timestamps } from "../helper/timestamp-helper";
import { ComplianceFramework } from "@/constants/compliance";

export const jiraProject = sqliteTable("jira_project", {
  id: text("id").primaryKey(),
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

  // FK to Atlassian Resource
  cloudId: text("cloud_id").notNull().references(() => atlassianResource.cloudId, { onDelete: "cascade" }),

  ...timestamps
},
  (table) => [index("idx_jira_project_cloud_id").on(table.cloudId)]
);

export const jiraProjectIssueType = sqliteTable("jira_project_issue_type", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  subtask: integer("subtask", { mode: "boolean" }).notNull(),
  avatarId: integer("avatar_id"),
  hierarchyLevel: integer("hierarchy_level"),
  self: text("self").notNull(),

  // FK to jira project
  projectId: text("project_id").notNull().references(() => jiraProject.id, { onDelete: "cascade" }),

  ...timestamps
},
  (table) => [index("idx_jira_project_issue_type_project_id").on(table.projectId)]
);

export const jiraProjectCompliance = sqliteTable("jira_project_compliance", {
  frameworks: text("frameworks", { mode: "json" }).$type<ComplianceFramework[]>().notNull(),

  // Denormalized last updated by info
  lastUpdatedById: text("last_updated_by_id"),
  lastUpdatedByName: text("last_updated_by_name"),
  lastUpdatedByEmail: text("last_updated_by_email"),
  lastUpdatedByAvatar: text("last_updated_by_avatar"),

  // FK to jira project, now also the primary key
  projectId: text("project_id").primaryKey().references(() => jiraProject.id, { onDelete: "cascade" }),
  ...timestamps
});

export const jiraProjectRelations = relations(jiraProject, ({ one, many }) => ({
  resource: one(atlassianResource, {
    fields: [jiraProject.cloudId],
    references: [atlassianResource.cloudId],
  }),
  issueTypes: many(jiraProjectIssueType),
  compliance: one(jiraProjectCompliance, {
    fields: [jiraProject.id],
    references: [jiraProjectCompliance.projectId],
  }),
}));

export const jiraProjectIssueTypeRelations = relations(jiraProjectIssueType, ({ one }) => ({
  project: one(jiraProject, {
    fields: [jiraProjectIssueType.projectId],
    references: [jiraProject.id],
  }),
}));

export const jiraProjectComplianceRelations = relations(jiraProjectCompliance, ({ one }) => ({
  project: one(jiraProject, {
    fields: [jiraProjectCompliance.projectId],
    references: [jiraProject.id],
  }),
}));
