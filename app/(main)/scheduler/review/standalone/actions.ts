"use server"

import { getServerSession } from "@/lib/get-server-session"
import { upsertStandaloneTestCases, getTestCasesByRequirementId } from "@/db/queries/standalone-testcase-queries"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const standaloneTestCaseInputSchema = z.object({
  id: z.string().optional(),
  requirementId: z.string(),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().min(1, "Description is required"),
  generatedBy: z.enum(["ai", "manual"] as const),
})

export async function saveStandaloneTestCasesDraft(testCases: z.infer<typeof standaloneTestCaseInputSchema>[]) {
  const session = await getServerSession()
  if (!session) {
    throw new Error("Unauthorized")
  }

  try {
    const validatedTestCases = testCases.map(tc => standaloneTestCaseInputSchema.parse(tc))

    if (validatedTestCases.length > 0) {
      const requirementId = validatedTestCases[0].requirementId
      const [requirementData] = await getTestCasesByRequirementId(requirementId, session.user.id)
      if (!requirementData || requirementData.length === 0) {
        throw new Error("Access denied: You don't have permission to modify test cases for this requirement")
      }
    }

    await upsertStandaloneTestCases(validatedTestCases, session.user.id)

    revalidatePath("/scheduler/review/standalone")

    return { success: true }
  } catch (error) {
    console.error("Error saving standalone test cases:", error)
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.issues.map((e: unknown) => (e as { message: string }).message).join(", ")}`)
    }
    throw new Error("Failed to save test cases")
  }
}