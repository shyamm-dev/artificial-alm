import { db } from "@/db/drizzle"
import { eq, and } from "drizzle-orm"
import { standaloneScheduledJobRequirement, standaloneScheduledJobRequirementTestCase, standaloneScheduledJob } from "@/db/schema/standalone-scheduled-jobs-schema"
import { standaloneProject } from "@/db/schema/standalone-project-schema"
import { createInsertSchema } from "drizzle-zod"
import { stripUndefined } from "@/db/helper/sync-helpers"
import { BatchItem } from "drizzle-orm/batch"
import { z } from "zod"

const testCaseUpsertSchema = createInsertSchema(standaloneScheduledJobRequirementTestCase, {
  id: z.string().optional(),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().min(1, "Description is required"),
  generatedBy: z.enum(["ai", "manual"]),
}).omit({ createdAt: true, updatedAt: true })

export function getTestCasesByRequirementId(requirementId: string, userId: string) {
  return Promise.all([
    db.select({
      id: standaloneScheduledJobRequirement.id,
      requirementName: standaloneScheduledJobRequirement.name,
      status: standaloneScheduledJobRequirement.status,
      reason: standaloneScheduledJobRequirement.reason,
      projectName: standaloneProject.name,
      projectId: standaloneProject.id,
      jobName: standaloneScheduledJob.name
    })
      .from(standaloneScheduledJobRequirement)
      .innerJoin(standaloneScheduledJob, eq(standaloneScheduledJobRequirement.jobId, standaloneScheduledJob.id))
      .innerJoin(standaloneProject, eq(standaloneScheduledJob.projectId, standaloneProject.id))
      .where(
        and(
          eq(standaloneScheduledJobRequirement.id, requirementId),
          eq(standaloneProject.userId, userId)
        )
      ),

    db.select({
      id: standaloneScheduledJobRequirementTestCase.id,
      requirementId: standaloneScheduledJobRequirementTestCase.requirementId,
      summary: standaloneScheduledJobRequirementTestCase.summary,
      description: standaloneScheduledJobRequirementTestCase.description,
      generatedBy: standaloneScheduledJobRequirementTestCase.generatedBy,
      modifiedByUserId: standaloneScheduledJobRequirementTestCase.modifiedByUserId,
      createdAt: standaloneScheduledJobRequirementTestCase.createdAt,
      updatedAt: standaloneScheduledJobRequirementTestCase.updatedAt
    })
      .from(standaloneScheduledJobRequirementTestCase)
      .innerJoin(standaloneScheduledJobRequirement, eq(standaloneScheduledJobRequirementTestCase.requirementId, standaloneScheduledJobRequirement.id))
      .innerJoin(standaloneScheduledJob, eq(standaloneScheduledJobRequirement.jobId, standaloneScheduledJob.id))
      .innerJoin(standaloneProject, eq(standaloneScheduledJob.projectId, standaloneProject.id))
      .where(
        and(
          eq(standaloneScheduledJobRequirementTestCase.requirementId, requirementId),
          eq(standaloneProject.userId, userId)
        )
      )
      .orderBy(standaloneScheduledJobRequirementTestCase.createdAt)
  ])
}

export async function upsertStandaloneTestCases(
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
      const updateData = stripUndefined({
        summary: validatedData.summary,
        description: validatedData.description,
        modifiedByUserId: validatedData.modifiedByUserId,
        updatedAt: new Date().toISOString()
      })
      batchQueries.push(
        db.update(standaloneScheduledJobRequirementTestCase)
          .set(updateData)
          .where(eq(standaloneScheduledJobRequirementTestCase.id, testCase.id))
      )
    } else {
      const insertData = stripUndefined({
        requirementId: validatedData.requirementId,
        summary: validatedData.summary,
        description: validatedData.description,
        generatedBy: validatedData.generatedBy,
        modifiedByUserId: validatedData.modifiedByUserId
      })
      batchQueries.push(
        db.insert(standaloneScheduledJobRequirementTestCase)
          .values(insertData)
      )
    }
  }

  if (batchQueries.length > 0) {
    await db.batch(batchQueries as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]])
  }
}
