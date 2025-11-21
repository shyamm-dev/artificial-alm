import { db } from "@/db/drizzle";
import { scheduledJobIssue, scheduledJob } from "@/db/schema/scheduled-jobs-schema";
import { eq, and, count } from "drizzle-orm";

export async function getJiraProjectTestCaseStats(projectId: string, userId: string) {
  const stats = await db
    .select({
      status: scheduledJobIssue.status,
      count: count(),
    })
    .from(scheduledJobIssue)
    .innerJoin(scheduledJob, eq(scheduledJobIssue.jobId, scheduledJob.id))
    .where(
      and(
        eq(scheduledJob.projectId, projectId),
        eq(scheduledJob.createdByUserId, userId)
      )
    )
    .groupBy(scheduledJobIssue.status);

  return {
    success: stats.find((s) => s.status === "completed")?.count || 0,
    failed: stats.find((s) => s.status === "failed")?.count || 0,
    inProgress: stats.find((s) => s.status === "in_progress")?.count || 0,
    pending: stats.find((s) => s.status === "pending")?.count || 0,
    total: stats.reduce((acc, s) => acc + s.count, 0),
  };
}
