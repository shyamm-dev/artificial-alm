import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { timestamps } from "../helper/timestamp-helper";
import { ComplianceFramework } from "@/constants/shared-constants";
import { user } from "@/auth-schema";

export const standaloneProject = sqliteTable("standalone_project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),

  // FK to user
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),

  ...timestamps
},
  (table) => [index("idx_standalone_project_user_id").on(table.userId)]
);

export const standaloneProjectCompliance = sqliteTable("standalone_project_compliance", {
  frameworks: text("frameworks", { mode: "json" }).$type<ComplianceFramework[]>().notNull(),

  // FK to standalone project, also the primary key
  projectId: text("project_id").primaryKey().references(() => standaloneProject.id, { onDelete: "cascade" }),

  ...timestamps
});

export const standaloneProjectRelations = relations(standaloneProject, ({ one }) => ({
  user: one(user, {
    fields: [standaloneProject.userId],
    references: [user.id],
  }),
  compliance: one(standaloneProjectCompliance, {
    fields: [standaloneProject.id],
    references: [standaloneProjectCompliance.projectId],
  }),
}));

export const standaloneProjectComplianceRelations = relations(standaloneProjectCompliance, ({ one }) => ({
  project: one(standaloneProject, {
    fields: [standaloneProjectCompliance.projectId],
    references: [standaloneProject.id],
  }),
}));
