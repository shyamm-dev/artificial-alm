import { db } from "@/db/drizzle"
import { eq } from "drizzle-orm"
import { scheduledJobIssue } from "@/db/schema/scheduled-jobs-schema"
import { ScheduledJobIssueStatus } from "@/constants/shared-constants"

export async function updateIssueStatus(issueId: string, status: ScheduledJobIssueStatus) {
  await db
    .update(scheduledJobIssue)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(scheduledJobIssue.id, issueId))
}