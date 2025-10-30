import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "@/auth-schema";
import { standaloneProject } from "./standalone-project-schema";
import { timestamps } from "../helper/timestamp-helper";
import { StandaloneScheduledJobIssueStatus, TestCaseGeneratedBy } from "@/constants/shared-constants";
import { randomUUID } from "crypto";

export const standaloneScheduledJob = sqliteTable("standalone_scheduled_job", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  projectId: text("project_id").notNull().references(() => standaloneProject.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),

  ...timestamps,
},
  (table) => [
    index("idx_standalone_scheduled_job_project_id").on(table.projectId),
  ]
);

export const standaloneScheduledJobRequirement = sqliteTable("standalone_scheduled_job_requirement", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  jobId: text("job_id").notNull().references(() => standaloneScheduledJob.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  status: text("status").$type<StandaloneScheduledJobIssueStatus>().notNull().default("pending"),
  reason: text("reason"),

  ...timestamps,
},
  (table) => [
    index("idx_standalone_scheduled_job_requirement_job_id").on(table.jobId),
  ]
);

export const standaloneScheduledJobRequirementTestCase = sqliteTable("standalone_scheduled_job_requirement_test_case", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  requirementId: text("requirement_id").notNull().references(() => standaloneScheduledJobRequirement.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  generatedBy: text("generated_by").$type<TestCaseGeneratedBy>().notNull().default("ai"),
  modifiedByUserId: text("modified_by_user_id").references(() => user.id, { onDelete: "set null" }),

  ...timestamps,
},
  (table) => [
    index("idx_standalone_scheduled_job_requirement_test_case_requirement_id").on(table.requirementId),
    index("idx_standalone_scheduled_job_requirement_test_case_modified_by").on(table.modifiedByUserId),
  ]
);

export const standaloneScheduledJobRelations = relations(standaloneScheduledJob, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [standaloneScheduledJob.createdByUserId],
    references: [user.id],
  }),
  project: one(standaloneProject, {
    fields: [standaloneScheduledJob.projectId],
    references: [standaloneProject.id],
  }),
  requirements: many(standaloneScheduledJobRequirement),
}));

export const standaloneScheduledJobRequirementRelations = relations(standaloneScheduledJobRequirement, ({ one, many }) => ({
  job: one(standaloneScheduledJob, {
    fields: [standaloneScheduledJobRequirement.jobId],
    references: [standaloneScheduledJob.id],
  }),
  testCases: many(standaloneScheduledJobRequirementTestCase),
}));

export const standaloneScheduledJobRequirementTestCaseRelations = relations(standaloneScheduledJobRequirementTestCase, ({ one }) => ({
  requirement: one(standaloneScheduledJobRequirement, {
    fields: [standaloneScheduledJobRequirementTestCase.requirementId],
    references: [standaloneScheduledJobRequirement.id],
  }),
  modifiedBy: one(user, {
    fields: [standaloneScheduledJobRequirementTestCase.modifiedByUserId],
    references: [user.id],
  }),
}));
