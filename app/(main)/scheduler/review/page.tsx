import * as React from "react"
import { getServerSession } from "@/lib/get-server-session"
import { redirect } from "next/navigation"
import { ReviewTestCases } from "./review-testcases"
import { getTestCasesByIssueId } from "@/db/queries/testcase-queries"
import { AccessDenied } from "./access-denied"

interface ReviewPageProps {
  searchParams: Promise<{ issueId?: string; tab?: string }>
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const session = await getServerSession()
  if (!session) {
    redirect("/login")
  }

  const params = await searchParams
  const issueId = params.issueId
  const tab = params.tab || "jira"

  if (!issueId) {
    redirect(`/scheduler?tab=${tab}`)
  }

  const [issue, issueTypes, testCases] = await getTestCasesByIssueId(issueId, session.user.id)

  if (issue.length === 0) {
    return <AccessDenied tab={tab} />
  }

  if (testCases.length === 0 && issue[0].status !== "failed") {
    redirect(`/scheduler?tab=${tab}`)
  }

  return (
    <div className="px-4 lg:px-6">
      <ReviewTestCases issue={issue[0]} issueTypes={issueTypes} testCases={testCases} tab={tab} />
    </div>
  )
}
