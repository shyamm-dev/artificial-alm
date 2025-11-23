"use server"

import { getServerSession } from "@/lib/get-server-session"
import { getTestCasesByIssueId } from "@/db/queries/testcase-queries"
import { updateIssueStatus } from "@/db/queries/scheduled-job-queries"
import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const deployTestCasesSchema = z.object({
  issueId: z.string(),
  issueTypeId: z.string(),
  testCases: z.array(z.object({
    id: z.string(),
    summary: z.string().min(1),
    description: z.string().min(1),
  }))
})

function parseDescriptionForJira(description: string): string {
  try {
    const parsed = JSON.parse(description)
    
    if (parsed.type === 'functional') {
      return `Type: Functional

Purpose: ${parsed.purpose || 'NA'}

Preconditions: ${parsed.preconditions || 'NA'}

Testing Procedure:
${(parsed.testing_procedure || []).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') || 'NA'}

Expected Result: ${parsed.expected_result || 'NA'}

Requirement Coverage: ${parsed.requirement_coverage || 'NA'}`
    }
    
    if (parsed.type === 'non-functional' || parsed.type === 'non_functional') {
      return `Type: Non-Functional

Test Category: ${parsed.test_category || 'NA'}

Preconditions: ${parsed.preconditions || 'NA'}

Testing Procedure:
${(parsed.testing_procedure || []).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') || 'NA'}

Expected Result: ${parsed.expected_result || 'NA'}

Acceptance Criteria: ${parsed.acceptance_criteria || 'NA'}`
    }
    
    if (parsed.type === 'compliance') {
      return `Type: Compliance

Compliance Rule: ${parsed.compliance_rule || 'NA'}

Preconditions: ${parsed.preconditions || 'NA'}

Testing Procedure:
${(parsed.testing_procedure || []).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') || 'NA'}

Expected Result: ${parsed.expected_result || 'NA'}

Compliance Impact: ${parsed.compliance_impact || 'NA'}`
    }
    
    return description
  } catch {
    return description
  }
}

export async function deployTestCasesToJira(data: z.infer<typeof deployTestCasesSchema>) {
  const session = await getServerSession()
  if (!session) {
    throw new Error("Unauthorized")
  }

  try {
    const validatedData = deployTestCasesSchema.parse(data)
    
    // Get issue details to verify access and get project info
    const [issueData] = await getTestCasesByIssueId(validatedData.issueId, session.user.id)
    if (!issueData || issueData.length === 0) {
      throw new Error("Access denied: You don't have permission to deploy test cases for this issue")
    }

    const issue = issueData[0]
    
    // Prepare issues for bulk creation
    const issuesToCreate = validatedData.testCases.map(testCase => ({
      summary: testCase.summary,
      description: parseDescriptionForJira(testCase.description),
      projectId: issue.projectId,
      issueTypeId: validatedData.issueTypeId,
      parentId: issue.issueId
    }))

    // Get cloud ID from the issue data
    const cloudId = issue.cloudId
    
    const result = await jiraClient.bulkCreateIssues(cloudId, issuesToCreate)
    
    if (result.error) {
      throw result.error
    }

    // Update issue status to deployed
    await updateIssueStatus(validatedData.issueId, "deployed_to_jira")
    
    revalidatePath("/scheduler")

    return { success: true, data: result.data }
  } catch (error) {
    console.error("Error deploying test cases to Jira:", error)
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.issues.map((e: unknown) => (e as { message: string }).message).join(", ")}`)
    }
    throw new Error("Failed to deploy test cases to Jira")
  }
}