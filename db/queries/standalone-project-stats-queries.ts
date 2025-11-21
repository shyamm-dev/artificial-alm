import { db } from "@/db/drizzle"
import { eq, and, sql } from "drizzle-orm"
import { standaloneProject } from "@/db/schema/standalone-project-schema"
import { standaloneScheduledJob, standaloneScheduledJobRequirement } from "@/db/schema/standalone-scheduled-jobs-schema"

export async function getProjectTestCaseStats(projectId: string, userId: string) {
  const result = await db
    .select({
      success: sql<number>`CAST(COUNT(CASE WHEN ${standaloneScheduledJobRequirement.status} = 'completed' THEN 1 END) AS INTEGER)`,
      failed: sql<number>`CAST(COUNT(CASE WHEN ${standaloneScheduledJobRequirement.status} = 'failed' THEN 1 END) AS INTEGER)`,
      inProgress: sql<number>`CAST(COUNT(CASE WHEN ${standaloneScheduledJobRequirement.status} = 'in_progress' THEN 1 END) AS INTEGER)`,
      pending: sql<number>`CAST(COUNT(CASE WHEN ${standaloneScheduledJobRequirement.status} = 'pending' THEN 1 END) AS INTEGER)`,
      total: sql<number>`CAST(COUNT(*) AS INTEGER)`
    })
    .from(standaloneScheduledJobRequirement)
    .innerJoin(standaloneScheduledJob, eq(standaloneScheduledJobRequirement.jobId, standaloneScheduledJob.id))
    .innerJoin(standaloneProject, eq(standaloneScheduledJob.projectId, standaloneProject.id))
    .where(
      and(
        eq(standaloneProject.id, projectId),
        eq(standaloneProject.userId, userId)
      )
    )

  return result[0] || { success: 0, failed: 0, inProgress: 0, pending: 0, total: 0 }
}
