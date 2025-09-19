import { NextRequest, NextResponse } from "next/server"
import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api"
import { hasAccessToResource } from "@/db/queries/user-project-queries"
import { getServerSession } from "@/lib/get-server-session"
import { buildJQL } from "@/lib/jql-builder"
import { jiraIssueSearchSchema } from "@/lib/schemas/jira-search"
import { db } from "@/db/drizzle"
import { scheduledJobIssue } from "@/db/schema/scheduled-jobs-schema"
import { inArray } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const params = {
      cloudId: body.cloudId,
      projectId: body.projectId,
      filters: body.filters
    }

    const validatedParams = jiraIssueSearchSchema.parse(params)

    const hasAccess = await hasAccessToResource(
      session.user.id,
      validatedParams.cloudId,
      validatedParams.projectId
    )
    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized to access this project" }, { status: 403 })
    }

    const jql = buildJQL(validatedParams.projectId, validatedParams.filters)

    const result = await jiraClient.searchJiraIssues(validatedParams.cloudId, jql)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    // Get already scheduled issue IDs with their status
    const scheduledIssues = await db
      .select({ 
        issueId: scheduledJobIssue.issueId, 
        status: scheduledJobIssue.status 
      })
      .from(scheduledJobIssue)
      .where(inArray(scheduledJobIssue.status, ["pending", "in_progress", "completed"]))

    const scheduledIssueMap = new Map(
      scheduledIssues.map(item => [item.issueId, item.status])
    )

    // Add scheduled status to issues
    const issuesWithStatus = result.data.issues.map(issue => ({
      ...issue,
      scheduledStatus: scheduledIssueMap.get(issue.id) || null
    }))

    return NextResponse.json({
      ...result.data,
      issues: issuesWithStatus
    })
  } catch (error) {
    console.error("Jira search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
