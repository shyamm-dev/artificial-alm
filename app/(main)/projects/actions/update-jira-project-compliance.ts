"use server"

import { getServerSession } from "@/lib/get-server-session"
import { db } from "@/db/drizzle"
import { jiraProjectCompliance } from "@/db/schema/jira-project-schema"
import { eq } from "drizzle-orm"
import { ComplianceFramework } from "@/constants/shared-constants"

export async function updateJiraProjectCompliance(projectId: string, frameworks: string[]) {
  const session = await getServerSession()
  if (!session?.user) {
    return { success: false, message: "Unauthorized" }
  }

  try {
    const existing = await db.select()
      .from(jiraProjectCompliance)
      .where(eq(jiraProjectCompliance.projectId, projectId))
      .limit(1)

    if (existing.length > 0) {
      await db.update(jiraProjectCompliance)
        .set({
          frameworks: frameworks as ComplianceFramework[],
          lastUpdatedById: session.user.id,
          lastUpdatedByName: session.user.name,
          lastUpdatedByEmail: session.user.email,
          lastUpdatedByAvatar: session.user.image,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(jiraProjectCompliance.projectId, projectId))
    } else {
      await db.insert(jiraProjectCompliance).values({
        projectId,
        frameworks: frameworks as ComplianceFramework[],
        lastUpdatedById: session.user.id,
        lastUpdatedByName: session.user.name,
        lastUpdatedByEmail: session.user.email,
        lastUpdatedByAvatar: session.user.image,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating Jira project compliance:", error)
    return { success: false, message: "Failed to update project" }
  }
}
