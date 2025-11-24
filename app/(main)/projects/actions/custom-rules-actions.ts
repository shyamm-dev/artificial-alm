"use server"

import { getServerSession } from "@/lib/get-server-session"
import { getProjectCustomRules, createProjectCustomRule, updateProjectCustomRule, deleteProjectCustomRule, toggleProjectCustomRuleStatus, getAllCustomRuleTags, type ProjectCustomRule, type CustomRuleTag } from "@/db/queries/project-custom-rules-queries"
import { db } from "@/db/drizzle"
import { standaloneProject, userAtlassianProjectAccess } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { generateRuleTags } from "@/data-access-layer/ai/rule-tag-generator"

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

export async function getAllCustomRuleTagsAction(): Promise<{ success: boolean; message?: string; data?: CustomRuleTag[] }> {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" }
  }

  const tags = await getAllCustomRuleTags()
  return { success: true, data: tags }
}

export async function generateRuleTagsAction(data: {
  ruleTitle: string
  ruleDescription: string
}): Promise<{ success: boolean; message?: string; data?: { selectedTags: string[]; reasoning: string } }> {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" }
  }

  try {
    const allTags = await getAllCustomRuleTags()
    
    const result = await generateRuleTags({
      ruleTitle: data.ruleTitle,
      ruleDescription: data.ruleDescription,
      availableTags: allTags.map(t => ({ name: t.name, description: t.description }))
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to generate tags:", error)
    return { success: false, message: "AI cannot generate tags right now" }
  }
}
