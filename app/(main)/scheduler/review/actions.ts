"use server"

import { getServerSession } from "@/lib/get-server-session"
import { upsertTestCases, getTestCasesByIssueId } from "@/db/queries/testcase-queries"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const testCaseInputSchema = z.object({
  id: z.string().optional(),
  issueId: z.string(),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().min(1, "Description is required"),
  generatedBy: z.enum(["ai", "manual"] as const),
})

export async function saveTestCasesDraft(testCases: z.infer<typeof testCaseInputSchema>[]) {
  const session = await getServerSession()
  if (!session) {
    throw new Error("Unauthorized")
  }

  try {
    // Validate input data
    const validatedTestCases = testCases.map(tc => testCaseInputSchema.parse(tc))

    // Verify user has access to the project by checking if they can access the issue
    if (validatedTestCases.length > 0) {
      const issueId = validatedTestCases[0].issueId
      const [issueData] = await getTestCasesByIssueId(issueId, session.user.id)
      if (!issueData || issueData.length === 0) {
        throw new Error("Access denied: You don't have permission to modify test cases for this issue")
      }
    }

    await upsertTestCases(validatedTestCases, session.user.id)

    revalidatePath("/scheduler/review")

    return { success: true }
  } catch (error) {
    console.error("Error saving test cases:", error)
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.issues.map((e: unknown) => (e as { message: string }).message).join(", ")}`)
    }
    throw new Error("Failed to save test cases")
  }
}
