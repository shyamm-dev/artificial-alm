"use server"

import { getServerSession } from "@/lib/get-server-session"
import { getProjectTestCaseStats } from "@/db/queries/standalone-project-stats-queries"
import { revalidatePath } from "next/cache"
import { tryCatch } from "@/lib/try-catch"

export async function refreshProjectStats(projectId: string) {
  const session = await getServerSession()
  if (!session) {
    return { success: false, message: "Unauthorized" }
  }

  const { data, error } = await tryCatch(getProjectTestCaseStats(projectId, session.user.id))
  
  if (error) {
    return { success: false, message: "Failed to refresh stats" }
  }

  revalidatePath("/projects")
  return { success: true, stats: data }
}
