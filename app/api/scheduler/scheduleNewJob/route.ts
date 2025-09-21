import { NextRequest, NextResponse } from "next/server"
import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api"
import { hasAccessToResource } from "@/db/queries/user-project-queries"
import { getServerSession } from "@/lib/get-server-session"
import { scheduleJobSchema } from "@/lib/schemas/schedule-job"
import { createScheduledJobWithIssues } from "@/db/queries/scheduled-jobs-queries"
import { transformJiraIssues } from "@/db/helper/sync-helpers"
import scheduledAiTestcaseGenJob from "@/data-access-layer/job-scheduler-api/job-scheduler"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = scheduleJobSchema.parse(body)

    const hasAccess = await hasAccessToResource(
      session.user.id,
      validatedData.cloudId,
      validatedData.projectId
    )
    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized to access this project" }, { status: 403 })
    }

    const result = await jiraClient.bulkFetchJiraIssues(validatedData.cloudId, validatedData.issueIds)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    if (!result.data) {
      return NextResponse.json({ error: "No data returned from Jira" }, { status: 500 })
    }

    const transformedIssues = transformJiraIssues(result.data.issues)

    const issueIds = await createScheduledJobWithIssues({
      cloudId: validatedData.cloudId,
      projectId: validatedData.projectId,
      name: validatedData.jobName,
      createdByUserId: session.user.id
    }, transformedIssues)

    await scheduledAiTestcaseGenJob(issueIds.map(id => id.toString()))

    return NextResponse.json({ message: "Job scheduled successfully" })
  } catch (error) {
    console.error("Schedule job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
