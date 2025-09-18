import { db } from "@/db/drizzle";
import { scheduledJob, scheduledJobIssue } from "@/db/schema/scheduled-jobs-schema";
import { userAtlassianProjectAccess } from "@/db/schema/user-resource-join-schema";
import { jiraProjectIssueType } from "@/db/schema/jira-project-schema";
import { createInsertSchema } from "drizzle-zod";
import { stripUndefined } from "@/db/helper/sync-helpers";
import { eq, and, isNotNull, desc, asc, count, inArray, like, or } from "drizzle-orm";
import type { JiraIssue } from "@/data-access-layer/types";
import type { ScheduledJobIssueStatus } from "@/constants/shared-constants";

const scheduledJobInsertSchema = createInsertSchema(scheduledJob);
const scheduledJobIssueInsertSchema = createInsertSchema(scheduledJobIssue);

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

export async function getScheduledJobIssues(
  userId: string,
  pagination: { page: number; pageSize: number },
  filters?: { search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }
) {
  const userProjectsSubquery = db.select({ projectId: userAtlassianProjectAccess.projectId })
    .from(userAtlassianProjectAccess)
    .where(
      and(
        eq(userAtlassianProjectAccess.userId, userId),
        isNotNull(userAtlassianProjectAccess.projectId)
      )
    )

  const whereClause = and(
    inArray(scheduledJob.projectId, userProjectsSubquery),
    filters?.search ? or(
      like(scheduledJobIssue.issueKey, `%${filters.search}%`),
      like(scheduledJobIssue.summary, `%${filters.search}%`)
    ) : undefined
  )

  return Promise.all([
    db.select({
      id: scheduledJobIssue.id,
      issueKey: scheduledJobIssue.issueKey,
      summary: scheduledJobIssue.summary,
      status: scheduledJobIssue.status,
      jobName: scheduledJob.name,
      issueTypeIconUrl: jiraProjectIssueType.iconUrl,
      issueTypeName: jiraProjectIssueType.name,
      createdAt: scheduledJobIssue.createdAt,
      updatedAt: scheduledJobIssue.updatedAt
    })
      .from(scheduledJobIssue)
      .innerJoin(scheduledJob, eq(scheduledJobIssue.jobId, scheduledJob.id))
      .innerJoin(jiraProjectIssueType, eq(scheduledJobIssue.issueTypeId, jiraProjectIssueType.id))
      .where(whereClause)
      .orderBy(
        filters?.sortBy === 'createdAt' 
          ? (filters.sortOrder === 'asc' ? asc(scheduledJobIssue.createdAt) : desc(scheduledJobIssue.createdAt))
          : filters?.sortBy === 'updatedAt'
          ? (filters.sortOrder === 'asc' ? asc(scheduledJobIssue.updatedAt) : desc(scheduledJobIssue.updatedAt))
          : desc(scheduledJobIssue.createdAt)
      )
      .limit(pagination.pageSize ?? 10)
      .offset(((pagination.page ?? 1) - 1) * (pagination.pageSize ?? 10)),

    db.select({ total: count() })
      .from(scheduledJobIssue)
      .innerJoin(scheduledJob, eq(scheduledJobIssue.jobId, scheduledJob.id))
      .innerJoin(jiraProjectIssueType, eq(scheduledJobIssue.issueTypeId, jiraProjectIssueType.id))
      .where(whereClause)
  ]).then(([data, [{ total }]]) => ({ data, total }))
}
