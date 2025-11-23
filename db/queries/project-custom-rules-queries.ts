import { eq, and } from "drizzle-orm";
import { db } from "../drizzle";
import { projectCustomRule } from "../schema";

export async function getProjectCustomRules(projectId: string, projectType: "standalone" | "jira") {
  return await db
    .select()
    .from(projectCustomRule)
    .where(
      and(
        eq(projectCustomRule.projectId, projectId),
        eq(projectCustomRule.projectType, projectType)
      )
    );
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
