import { NextRequest, NextResponse } from "next/server"
import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api"
import { hasAccessToResource } from "@/db/queries/user-project-queries"
import { getServerSession } from "@/lib/get-server-session"
import { buildJQL } from "@/lib/jql-builder"
import { jiraIssueSearchSchema } from "@/lib/schemas/jira-search"

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

    const result = await jiraClient.searchJiraIssues(validatedParams.cloudId, jql, ["summary", "issuetype", "description"])

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Jira search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
