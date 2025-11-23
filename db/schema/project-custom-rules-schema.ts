import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { timestamps } from "../helper/timestamp-helper";
import { standaloneProject } from "./standalone-project-schema";
import { jiraProject } from "./jira-project-schema";
import { user } from "@/auth-schema";

export const customRuleTag = sqliteTable("custom_rule_tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),

  ...timestamps
},
  (table) => [
    index("idx_custom_rule_tag_name").on(table.name)
  ]
);

export const projectCustomRule = sqliteTable("project_custom_rule", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  projectType: text("project_type", { enum: ["standalone", "jira"] }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity", { enum: ["low", "medium", "high", "critical"] }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),

  // FK to user
  createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "cascade" }),

  ...timestamps
},
  (table) => [
    index("idx_project_custom_rule_project").on(table.projectId, table.projectType),
    index("idx_project_custom_rule_created_by").on(table.createdBy)
  ]
);

export const projectCustomRuleRelations = relations(projectCustomRule, ({ one }) => ({
  creator: one(user, {
    fields: [projectCustomRule.createdBy],
    references: [user.id],
  }),
}));

export const standaloneProjectRelationsExtended = relations(standaloneProject, ({ many }) => ({
  customRules: many(projectCustomRule),
}));

export const jiraProjectRelationsExtended = relations(jiraProject, ({ many }) => ({
  customRules: many(projectCustomRule),
}));


