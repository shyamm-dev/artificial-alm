import * as React from "react"
import { getServerSession } from "@/lib/get-server-session"
import { redirect } from "next/navigation"
import { StandaloneReviewTestCases } from "./standalone-review-testcases"
import { getTestCasesByRequirementId } from "@/db/queries/standalone-testcase-queries"
import { AccessDenied } from "./access-denied"

interface StandaloneReviewPageProps {
  searchParams: Promise<{ requirementId?: string; tab?: string }>
}

export default async function StandaloneReviewPage({ searchParams }: StandaloneReviewPageProps) {
  const session = await getServerSession()
  if (!session) {
    redirect("/login")
  }

  const params = await searchParams
  const requirementId = params.requirementId
  const tab = params.tab || "standalone"

  if (!requirementId) {
    redirect(`/scheduler?tab=${tab}`)
  }

  const [requirement, testCases] = await getTestCasesByRequirementId(requirementId, session.user.id)

  if (requirement.length === 0) {
    return <AccessDenied tab={tab} />
  }

  if (testCases.length === 0 && requirement[0].status !== "failed") {
    redirect(`/scheduler?tab=${tab}`)
  }

  return (
    <div className="px-4 lg:px-6">
      <StandaloneReviewTestCases requirement={requirement[0]} testCases={testCases} tab={tab} />
    </div>
  )
}
