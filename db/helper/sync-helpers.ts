import { createInsertSchema } from "drizzle-zod";
import { atlassianResource } from "@/db/schema/atlassian-resource-schema";
import { jiraProject, jiraProjectIssueType } from "@/db/schema/jira-project-schema";
import { userAtlassianProjectAccess } from "@/db/schema/user-resource-join-schema";
import { AtlassianResourceWithProjects, JiraProject, JiraIssueType } from "@/data-access-layer/types";

// --- Zod Insert schemas validators from tables
export const atlassianResourceInsertSchema = createInsertSchema(atlassianResource);
export const jiraProjectInsertSchema = createInsertSchema(jiraProject);
export const jiraIssueTypeInsertSchema = createInsertSchema(jiraProjectIssueType);
export const userAccessInsertSchema = createInsertSchema(userAtlassianProjectAccess);

export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)) as T;
}

export function makeKey(cloudId: string, projectId: string | null | undefined) {
  return `${cloudId}:${projectId ?? "null"}`;
}

export function transformResource(apiRes: AtlassianResourceWithProjects) {
  return {
    cloudId: apiRes.id,
    name: apiRes.name,
    url: apiRes.url,
    scopes: JSON.stringify(apiRes.scopes),
    avatarUrl: apiRes.avatarUrl,
  };
}

export function transformProject(apiProj: JiraProject, cloudId: string) {
  return {
    id: apiProj.id,
    key: apiProj.key,
    name: apiProj.name,
    description: apiProj.description,
    self: apiProj.self,
    projectTypeKey: apiProj.projectTypeKey,
    simplified: apiProj.simplified,
    style: apiProj.style,
    isPrivate: apiProj.isPrivate,
    avatar48: apiProj.avatarUrls["48x48"],
    avatar32: apiProj.avatarUrls["32x32"],
    avatar24: apiProj.avatarUrls["24x24"],
    avatar16: apiProj.avatarUrls["16x16"],
    cloudId,
  };
}

export function transformIssueType(issue: JiraIssueType, projectId: string) {
  return {
    id: issue.id,
    name: issue.name,
    description: issue.description,
    iconUrl: issue.iconUrl,
    subtask: issue.subtask,
    avatarId: issue.avatarId,
    hierarchyLevel: issue.hierarchyLevel,
    self: issue.self,
    projectId,
  };
}

export function transformUserAccess(userId: string, cloudId: string, projectId: string | null) {
  return { userId, cloudId, projectId };
}
