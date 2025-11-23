"use server"

import { getServerSession } from "@/lib/get-server-session"
import { getProjectCustomRules, createProjectCustomRule, updateProjectCustomRule, deleteProjectCustomRule, toggleProjectCustomRuleStatus, type ProjectCustomRule } from "@/db/queries/project-custom-rules-queries"
import { db } from "@/db/drizzle"
import { standaloneProject, userAtlassianProjectAccess } from "@/db/schema"
import { eq, and } from "drizzle-orm"

async function verifyProjectAccess(projectId: string, projectType: "standalone" | "jira", userId: string) {
  if (projectType === "standalone") {
    const [project] = await db
      .select({ userId: standaloneProject.userId })
      .from(standaloneProject)
      .where(eq(standaloneProject.id, projectId))
      .limit(1)
    return project?.userId === userId
  } else {
    const [access] = await db
      .select({ userId: userAtlassianProjectAccess.userId })
      .from(userAtlassianProjectAccess)
      .where(
        and(
          eq(userAtlassianProjectAccess.projectId, projectId),
          eq(userAtlassianProjectAccess.userId, userId)
        )
      )
      .limit(1)
    return !!access
  }
}

export async function getProjectCustomRulesAction(projectId: string, projectType: "standalone" | "jira"): Promise<{ success: boolean; message?: string; data?: ProjectCustomRule[] }> {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" }
  }

  const hasAccess = await verifyProjectAccess(projectId, projectType, session.user.id)
  if (!hasAccess) {
    return { success: false, message: "Access denied" }
  }

  const rules = await getProjectCustomRules(projectId, projectType)
  return { success: true, data: rules }
}

export async function createProjectCustomRuleAction(data: {
  projectId: string
  projectType: "standalone" | "jira"
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  isActive: boolean
  tags: string[]
}) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" }
  }

  const hasAccess = await verifyProjectAccess(data.projectId, data.projectType, session.user.id)
  if (!hasAccess) {
    return { success: false, message: "Access denied" }
  }

  const id = crypto.randomUUID()
  await createProjectCustomRule({
    id,
    ...data,
    createdBy: session.user.id
  })

  return { success: true, message: "Rule created", data: { id } }
}

export async function updateProjectCustomRuleAction(
  ruleId: string,
  data: {
    title: string
    description: string
    severity: "low" | "medium" | "high" | "critical"
    isActive: boolean
    tags: string[]
  }
) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" }
  }

  await updateProjectCustomRule(ruleId, data)
  return { success: true, message: "Rule updated" }
}

export async function deleteProjectCustomRuleAction(ruleId: string) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" }
  }

  await deleteProjectCustomRule(ruleId)
  return { success: true, message: "Rule deleted" }
}

export async function toggleProjectCustomRuleStatusAction(ruleId: string, isActive: boolean) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" }
  }

  await toggleProjectCustomRuleStatus(ruleId, isActive)
  return { success: true, message: "Rule status updated" }
}
