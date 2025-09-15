import { NextRequest, NextResponse } from "next/server"
import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api"
import { hasAccessToResource } from "@/db/queries/user-project-queries"
import { getServerSession } from "@/lib/get-server-session"
import { scheduleJobSchema } from "@/lib/schemas/schedule-job"

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

    return NextResponse.json({ message: "Job scheduled successfully" })
  } catch (error) {
    console.error("Schedule job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
