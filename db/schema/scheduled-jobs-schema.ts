import { sqliteTable, text, index, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "@/auth-schema";
import { jiraProject, jiraProjectIssueType } from "./jira-project-schema";
import { timestamps } from "../helper/timestamp-helper";
import { ScheduledJobIssueStatus } from "@/constants/shared-constants";

export const scheduledJob = sqliteTable("scheduled_job", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  cloudId: text("cloud_id").notNull(),
  projectId: text("project_id")
    .notNull()
    .references(() => jiraProject.id, { onDelete: "cascade" }),

  name: text("name").notNull(),

  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),

  ...timestamps,
},
  (table) => [
    index("idx_scheduled_job_cloud_id").on(table.cloudId),
    index("idx_scheduled_job_project_id").on(table.projectId),
  ]
);

export const scheduledJobIssue = sqliteTable("scheduled_job_issue", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  jobId: text("job_id")
    .notNull()
    .references(() => scheduledJob.id, { onDelete: "cascade" }),

  issueId: text("issue_id").notNull(),
  issueKey: text("issue_key").notNull(),
  summary: text("summary").notNull(),
  description: text("description"),

  issueTypeId: text("issue_type_id")
    .notNull()
    .references(() => jiraProjectIssueType.id, { onDelete: "cascade" }),

  status: text("status").$type<ScheduledJobIssueStatus>().notNull().default("pending"),

  ...timestamps,
},
  (table) => [
    index("idx_scheduled_job_issue_job_id").on(table.jobId),
    index("idx_scheduled_job_issue_issue_id").on(table.issueId),
    uniqueIndex("uq_job_issue").on(table.jobId, table.issueId),
  ]
);

export const scheduledJobIssueTestCase = sqliteTable("scheduled_job_issue_test_case", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  issueId: text("issue_id")
    .notNull()
    .references(() => scheduledJobIssue.id, { onDelete: "cascade" }),

  summary: text("summary").notNull(),
  description: text("description").notNull(),

  linkedTo: text("linked_to"),

  modifiedByUserId: text("modified_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),

  ...timestamps,
},
  (table) => [
    index("idx_scheduled_job_issue_test_case_issue_id").on(table.issueId),
    index("idx_scheduled_job_issue_test_case_modified_by").on(table.modifiedByUserId),
  ]
);

export const scheduledJobRelations = relations(scheduledJob, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [scheduledJob.createdByUserId],
    references: [user.id],
  }),
  project: one(jiraProject, {
    fields: [scheduledJob.projectId],
    references: [jiraProject.id],
  }),
  issues: many(scheduledJobIssue),
}))

export const scheduledJobIssueRelations = relations(scheduledJobIssue, ({ one, many }) => ({
  job: one(scheduledJob, {
    fields: [scheduledJobIssue.jobId],
    references: [scheduledJob.id],
  }),
  issueType: one(jiraProjectIssueType, {
    fields: [scheduledJobIssue.issueTypeId],
    references: [jiraProjectIssueType.id],
  }),
  testCases: many(scheduledJobIssueTestCase),
}))

export const scheduledJobIssueTestCaseRelations = relations(scheduledJobIssueTestCase, ({ one }) => ({
  issue: one(scheduledJobIssue, {
    fields: [scheduledJobIssueTestCase.issueId],
    references: [scheduledJobIssue.id],
  }),
  modifiedBy: one(user, {
    fields: [scheduledJobIssueTestCase.modifiedByUserId],
    references: [user.id],
  }),
}))
