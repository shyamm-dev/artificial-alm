import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/get-server-session"
import { getScheduledJobIssues } from "@/db/queries/scheduled-jobs-queries"
import type { ScheduledJobIssueStatus } from "@/constants/shared-constants"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    const pagination = {
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "10")
    }

    const rawFilters = {
      status: searchParams.get("status"),
      summary: searchParams.get("summary"),
      issueKey: searchParams.get("issueKey"),
      jobName: searchParams.get("jobName"),
      issueTypeId: searchParams.get("issueTypeId"),
      projectId: searchParams.get("projectId")
    }

    const filters = Object.fromEntries(
      Object.entries(rawFilters).filter(([, value]) => value !== null)
    ) as {
      status?: ScheduledJobIssueStatus
      summary?: string
      issueKey?: string
      jobName?: string
      issueTypeId?: string
      projectId?: string
    }

    const result = await getScheduledJobIssues(session.user.id, pagination, filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get scheduled job issues error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}