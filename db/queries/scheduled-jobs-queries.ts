import { db } from "@/db/drizzle";
import { scheduledJob, scheduledJobIssue } from "@/db/schema/scheduled-jobs-schema";
import { createInsertSchema } from "drizzle-zod";
import { stripUndefined } from "@/db/helper/sync-helpers";
import type { JiraIssue } from "@/data-access-layer/types";

const scheduledJobInsertSchema = createInsertSchema(scheduledJob);
const scheduledJobIssueInsertSchema = createInsertSchema(scheduledJobIssue);

export function createScheduledJob(jobData: typeof scheduledJob.$inferInsert) {
  const parsedData = stripUndefined(scheduledJobInsertSchema.parse(jobData));
  return db.insert(scheduledJob).values(parsedData).returning({ id: scheduledJob.id });
}

export function createScheduledJobIssues(issuesData: (typeof scheduledJobIssue.$inferInsert)[]) {
  const parsedData = issuesData.map(issue => stripUndefined(scheduledJobIssueInsertSchema.parse(issue))) as typeof scheduledJobIssue.$inferInsert[];
  return db.insert(scheduledJobIssue).values(parsedData);
}

export function createScheduledJobWithIssues(jobData: typeof scheduledJob.$inferInsert, issues: JiraIssue[]) {
  return db.transaction(async (tx) => {
    const [{ id }] = await tx.insert(scheduledJob).values(stripUndefined(scheduledJobInsertSchema.parse(jobData))).returning({ id: scheduledJob.id })

    const issuesData = issues.map(issue => stripUndefined(scheduledJobIssueInsertSchema.parse({
      jobId: id,
      issueId: issue.id,
      issueKey: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description as string,
      issueTypeId: issue.fields.issuetype.id
    }))) as typeof scheduledJobIssue.$inferInsert[]

    await tx.insert(scheduledJobIssue).values(issuesData)
  })
}
