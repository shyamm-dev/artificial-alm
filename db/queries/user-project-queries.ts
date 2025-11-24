import { db } from "@/db/drizzle";
import { jiraProject, jiraProjectCompliance, jiraProjectIssueType } from "@/db/schema/jira-project-schema";
import { projectCustomRule } from "@/db/schema";
import { userAtlassianProjectAccess } from "@/db/schema/user-resource-join-schema";
import { atlassianResource } from "@/db/schema/atlassian-resource-schema";
import { stripUndefined } from "@/db/helper/sync-helpers";
import { createInsertSchema } from "drizzle-zod";
import { eq, count } from "drizzle-orm";

const jiraProjectComplianceInsertSchema = createInsertSchema(jiraProjectCompliance);

export function upsertProjectCompliance(complianceData: typeof jiraProjectCompliance.$inferInsert) {
  const parsedData = stripUndefined(jiraProjectComplianceInsertSchema.parse(complianceData));
  return db.insert(jiraProjectCompliance)
    .values(parsedData)
    .onConflictDoUpdate({ target: jiraProjectCompliance.projectId, set: parsedData });
}


export async function getUserResourcesAndProjects(userId: string) {
  const userAccessData = await db
    .select({
      userId: userAtlassianProjectAccess.userId,
      cloudId: userAtlassianProjectAccess.cloudId,
      projectId: userAtlassianProjectAccess.projectId,
      resource: atlassianResource,
      project: jiraProject,
      compliance: jiraProjectCompliance,
    })
    .from(userAtlassianProjectAccess)
    .leftJoin(atlassianResource, eq(userAtlassianProjectAccess.cloudId, atlassianResource.cloudId))
    .leftJoin(jiraProject, eq(userAtlassianProjectAccess.projectId, jiraProject.id))
    .leftJoin(jiraProjectCompliance, eq(jiraProject.id, jiraProjectCompliance.projectId))
    .where(eq(userAtlassianProjectAccess.userId, userId));

  const issueTypesMap = new Map<string, typeof jiraProjectIssueType.$inferSelect[]>();
  const projectIds = userAccessData.filter(d => d.project).map(d => d.project!.id);
  
  if (projectIds.length > 0) {
    for (const projectId of projectIds) {
      const types = await db
        .select()
        .from(jiraProjectIssueType)
        .where(eq(jiraProjectIssueType.projectId, projectId));
      issueTypesMap.set(projectId, types);
    }
  }

  return await Promise.all(
    userAccessData.map(async (data) => {
      const customRuleCount = data.project
        ? (await db.select({ count: count() }).from(projectCustomRule).where(eq(projectCustomRule.projectId, data.project.id)))[0]?.count || 0
        : 0;

      return {
        userId: data.userId,
        cloudId: data.cloudId,
        projectId: data.projectId,
        resource: data.resource!,
        project: data.project ? {
          ...data.project,
          issueTypes: issueTypesMap.get(data.project.id) || [],
          compliance: data.compliance,
        } : null,
        customRuleCount,
      };
    })
  );
}

export function hasAccessToResource(userId: string, cloudId: string, projectId: string) {
  return db.query.userAtlassianProjectAccess.findFirst({
    where: (u, { eq, and }) => and(eq(u.userId, userId), eq(u.cloudId, cloudId), eq(u.projectId, projectId))
  });
}

export function getUserAccessibleProjects(userId: string) {
  return db.query.userAtlassianProjectAccess.findMany({
    where: (u, { eq }) => eq(u.userId, userId),
    with: {
      project: {
        with: {
          issueTypes: true,
          compliance: true
        }
      }
    }
  }).then(userAccess => userAccess.map(access => access.project!).filter(Boolean));
}
