import { createInsertSchema } from "drizzle-zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { atlassianResource } from "@/db/schema/atlassian-resource-schema";
import { jiraProject, jiraProjectIssueType } from "@/db/schema/jira-project-schema";
import { userAtlassianProjectAccess } from "@/db/schema/user-resource-join-schema";
import { AtlassianResourceWithProjects, JiraProject, JiraIssueType } from "../types";
import { getServerSession } from "@/lib/get-server-session";
import { BatchItem } from "drizzle-orm/batch";

// --- Zod Insert schemas validators from tables
const atlassianResourceInsertSchema = createInsertSchema(atlassianResource);
const jiraProjectInsertSchema = createInsertSchema(jiraProject);
const jiraIssueTypeInsertSchema = createInsertSchema(jiraProjectIssueType);
const userAccessInsertSchema = createInsertSchema(userAtlassianProjectAccess);

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)) as T;
}

function makeKey(cloudId: string, projectId: string | null | undefined) {
  return `${cloudId}:${projectId ?? "null"}`;
}

function transformResource(apiRes: AtlassianResourceWithProjects) {
  return {
    cloudId: apiRes.id,
    name: apiRes.name,
    url: apiRes.url,
    scopes: JSON.stringify(apiRes.scopes),
    avatarUrl: apiRes.avatarUrl,
  };
}

function transformProject(apiProj: JiraProject, cloudId: string) {
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

function transformIssueType(issue: JiraIssueType, projectId: string) {
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

function transformUserAccess(userId: string, cloudId: string, projectId: string | null) {
  return { userId, cloudId, projectId };
}

/**
 * Sync Atlassian data with DB.
 *
 * Global tables (resources, projects, issue types):
 *   - Upsert only (no deletes)
 *
 * User access table (userAtlassianProjectAccess):
 *   - Insert missing access rows
 *   - Remove rows that no longer exist in the API for this user
 *
 * @param apiData AtlassianResourceWithProjects[] API response for the current user
 */
export async function syncAtlassianDataWithDB(apiData: AtlassianResourceWithProjects[]) {
  const session = await getServerSession();
  if (!session) throw new Error("No user session available");

  const userId = session.user.id;
  const batchQueries: BatchItem<"sqlite">[] = [];

  // Upsert global resource, projects, issueTypes
  for (const resource of apiData) {
    const parsedResource = stripUndefined(atlassianResourceInsertSchema.parse(transformResource(resource)));
    batchQueries.push(
      db.insert(atlassianResource)
        .values(parsedResource)
        .onConflictDoUpdate({ target: atlassianResource.cloudId, set: parsedResource })
    );

    for (const project of resource.projects) {
      const parsedProject = stripUndefined(jiraProjectInsertSchema.parse(transformProject(project, resource.id)));
      batchQueries.push(
        db.insert(jiraProject)
          .values(parsedProject)
          .onConflictDoUpdate({ target: jiraProject.id, set: parsedProject })
      );

      for (const issue of project.issueTypes) {
        const parsedIssue = stripUndefined(jiraIssueTypeInsertSchema.parse(transformIssueType(issue, project.id)));
        batchQueries.push(
          db.insert(jiraProjectIssueType)
            .values(parsedIssue)
            .onConflictDoUpdate({ target: jiraProjectIssueType.id, set: parsedIssue })
        );
      }
    }
  }

  // Build user access rows from API
  const userResourceAccessFromAPI = apiData.flatMap((resource) => {
    if (resource.projects.length === 0) {
      return [transformUserAccess(userId, resource.id, null)];
    }
    return resource.projects.map((proj) =>
      transformUserAccess(userId, resource.id, proj.id)
    );
  });

  const parsedUserResourceAccessFromAPI = userResourceAccessFromAPI.map((r) => userAccessInsertSchema.parse(r));

  // Fetch existing user access rows
  const existingAccess = await db
    .select()
    .from(userAtlassianProjectAccess)
    .where(eq(userAtlassianProjectAccess.userId, userId));

  const existingKeys = new Set(existingAccess.map((row) => makeKey(row.cloudId, row.projectId)));
  const desiredKeys = new Set(parsedUserResourceAccessFromAPI.map((row) => makeKey(row.cloudId, row.projectId)));

  // Insert missing rows
  for (const row of parsedUserResourceAccessFromAPI) {
    const key = makeKey(row.cloudId, row.projectId);
    if (!existingKeys.has(key)) {
      batchQueries.push(db.insert(userAtlassianProjectAccess).values(row));
    }
  }

  // Delete stale rows
  for (const row of existingAccess) {
    const key = makeKey(row.cloudId, row.projectId);
    if (!desiredKeys.has(key)) {
      batchQueries.push(
        db.delete(userAtlassianProjectAccess).where(
          and(
            eq(userAtlassianProjectAccess.userId, row.userId),
            eq(userAtlassianProjectAccess.cloudId, row.cloudId),
            row.projectId
              ? eq(userAtlassianProjectAccess.projectId, row.projectId)
              : isNull(userAtlassianProjectAccess.projectId)
          )
        )
      );
    }
  }

  return await db.batch(batchQueries as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]]);
}
