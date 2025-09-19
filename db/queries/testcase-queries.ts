import { db } from "@/db/drizzle"
import { eq, and, isNotNull, inArray } from "drizzle-orm"
import { scheduledJobIssue, scheduledJobIssueTestCase, scheduledJob } from "@/db/schema/scheduled-jobs-schema"
import { jiraProject, jiraProjectIssueType } from "@/db/schema/jira-project-schema"
import { userAtlassianProjectAccess } from "@/db/schema/user-resource-join-schema"
import { createInsertSchema } from "drizzle-zod"
import { stripUndefined } from "@/db/helper/sync-helpers"
import { BatchItem } from "drizzle-orm/batch"
import { z } from "zod"

const testCaseUpsertSchema = createInsertSchema(scheduledJobIssueTestCase, {
  id: z.string().optional(),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().min(1, "Description is required"),
  generatedBy: z.enum(["ai", "manual"]),
}).omit({ createdAt: true, updatedAt: true })

export function getTestCasesByIssueId(issueId: string, userId: string) {
  const userProjectsSubquery = db.select({ projectId: userAtlassianProjectAccess.projectId })
    .from(userAtlassianProjectAccess)
    .where(
      and(
        eq(userAtlassianProjectAccess.userId, userId),
        isNotNull(userAtlassianProjectAccess.projectId)
      )
    )

  return Promise.all([
    db.select({
      id: scheduledJobIssue.id,
      issueId: scheduledJobIssue.issueId,
      issueKey: scheduledJobIssue.issueKey,
      summary: scheduledJobIssue.summary,
      projectName: jiraProject.name,
      projectId: jiraProject.id,
      projectAvatar: jiraProject.avatar24,
      cloudId: jiraProject.cloudId,
      jobName: scheduledJob.name,
      issueTypeIcon: jiraProjectIssueType.iconUrl,
      issueTypeName: jiraProjectIssueType.name
    })
      .from(scheduledJobIssue)
      .innerJoin(scheduledJob, eq(scheduledJobIssue.jobId, scheduledJob.id))
      .innerJoin(jiraProject, eq(scheduledJob.projectId, jiraProject.id))
      .innerJoin(jiraProjectIssueType, eq(scheduledJobIssue.issueTypeId, jiraProjectIssueType.id))
      .where(
        and(
          eq(scheduledJobIssue.id, issueId),
          inArray(scheduledJob.projectId, userProjectsSubquery)
        )
      ),

    db.select({
      id: jiraProjectIssueType.id,
      name: jiraProjectIssueType.name,
      iconUrl: jiraProjectIssueType.iconUrl
    })
      .from(jiraProjectIssueType)
      .where(
        eq(jiraProjectIssueType.projectId, 
          db.select({ projectId: scheduledJob.projectId })
            .from(scheduledJobIssue)
            .innerJoin(scheduledJob, eq(scheduledJobIssue.jobId, scheduledJob.id))
            .where(eq(scheduledJobIssue.id, issueId))
            .limit(1)
        )
      ),

    db.select({
      id: scheduledJobIssueTestCase.id,
      issueId: scheduledJobIssueTestCase.issueId,
      summary: scheduledJobIssueTestCase.summary,
      description: scheduledJobIssueTestCase.description,
      generatedBy: scheduledJobIssueTestCase.generatedBy,
      modifiedByUserId: scheduledJobIssueTestCase.modifiedByUserId,
      createdAt: scheduledJobIssueTestCase.createdAt,
      updatedAt: scheduledJobIssueTestCase.updatedAt
    })
      .from(scheduledJobIssueTestCase)
      .innerJoin(scheduledJobIssue, eq(scheduledJobIssueTestCase.issueId, scheduledJobIssue.id))
      .innerJoin(scheduledJob, eq(scheduledJobIssue.jobId, scheduledJob.id))
      .where(
        and(
          eq(scheduledJobIssueTestCase.issueId, issueId),
          inArray(scheduledJob.projectId, userProjectsSubquery)
        )
      )
      .orderBy(scheduledJobIssueTestCase.createdAt)
  ])
}

export async function upsertTestCases(
  testCases: Array<z.infer<typeof testCaseUpsertSchema> & { id?: string }>,
  userId: string
) {
  const batchQueries: BatchItem<"sqlite">[] = []

  for (const testCase of testCases) {
    const validatedData = testCaseUpsertSchema.parse({
      ...testCase,
      modifiedByUserId: userId
    })

    if (testCase.id && !testCase.id.startsWith('new-')) {
      // Update existing test case
      const updateData = stripUndefined({
        summary: validatedData.summary,
        description: validatedData.description,
        modifiedByUserId: validatedData.modifiedByUserId,
        updatedAt: new Date().toISOString()
      })
      batchQueries.push(
        db.update(scheduledJobIssueTestCase)
          .set(updateData)
          .where(eq(scheduledJobIssueTestCase.id, testCase.id))
      )
    } else {
      // Insert new test case
      const insertData = stripUndefined({
        issueId: validatedData.issueId,
        summary: validatedData.summary,
        description: validatedData.description,
        generatedBy: validatedData.generatedBy,
        modifiedByUserId: validatedData.modifiedByUserId
      })
      batchQueries.push(
        db.insert(scheduledJobIssueTestCase)
          .values(insertData)
      )
    }
  }

  if (batchQueries.length > 0) {
    await db.batch(batchQueries as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]])
  }
}
