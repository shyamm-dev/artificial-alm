import * as React from "react"
import { getServerSession } from "@/lib/get-server-session"
import { redirect } from "next/navigation"
import { ReviewTestCases } from "./review-testcases"
import { getTestCasesByIssueId } from "@/db/queries/testcase-queries"

interface ReviewPageProps {
  searchParams: Promise<{ issueId?: string }>
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const session = await getServerSession()
  if (!session) {
    redirect("/login")
  }

  const params = await searchParams
  const issueId = params.issueId

  if (!issueId) {
    redirect("/scheduler")
  }

  const [issue, issueTypes, testCases] = await getTestCasesByIssueId(issueId, session.user.id)

  if (testCases.length === 0) {
    redirect("/scheduler")
  }

  return (
    <div className="px-4 lg:px-6">
      <ReviewTestCases issue={issue[0]} issueTypes={issueTypes} testCases={testCases}/>
    </div>
  )
}
