import { eq, and } from "drizzle-orm";
import { db } from "../drizzle";
import { projectCustomRule, customRuleTag } from "../schema";
import type { InferSelectModel } from "drizzle-orm";

export type ProjectCustomRule = InferSelectModel<typeof projectCustomRule>;
export type CustomRuleTag = InferSelectModel<typeof customRuleTag>;

export async function getProjectCustomRules(projectId: string, projectType: "standalone" | "jira"): Promise<ProjectCustomRule[]> {
  try {
    const result = await db
      .select({
        id: projectCustomRule.id,
        projectId: projectCustomRule.projectId,
        projectType: projectCustomRule.projectType,
        title: projectCustomRule.title,
        description: projectCustomRule.description,
        severity: projectCustomRule.severity,
        isActive: projectCustomRule.isActive,
        tags: projectCustomRule.tags,
        createdBy: projectCustomRule.createdBy,
        createdAt: projectCustomRule.createdAt,
        updatedAt: projectCustomRule.updatedAt
      })
      .from(projectCustomRule)
      .where(
        and(
          eq(projectCustomRule.projectId, projectId),
          eq(projectCustomRule.projectType, projectType)
        )
      );
    return result ?? [];
  } catch (error) {
    console.error("Error fetching custom rules:", error);
    return [];
  }
}

export async function createProjectCustomRule(data: {
  id: string;
  projectId: string;
  projectType: "standalone" | "jira";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  isActive: boolean;
  tags: string[];
  createdBy: string;
}) {
  await db.insert(projectCustomRule).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateProjectCustomRule(
  ruleId: string,
  data: {
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    isActive: boolean;
    tags: string[];
  }
) {
  await db
    .update(projectCustomRule)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projectCustomRule.id, ruleId));
}

export async function deleteProjectCustomRule(ruleId: string) {
  await db.delete(projectCustomRule).where(eq(projectCustomRule.id, ruleId));
}

export async function toggleProjectCustomRuleStatus(ruleId: string, isActive: boolean) {
  await db
    .update(projectCustomRule)
    .set({
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projectCustomRule.id, ruleId));
}

export async function getAllCustomRuleTags(): Promise<CustomRuleTag[]> {
  try {
    return await db.select().from(customRuleTag);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}
