import { db } from "@/db/drizzle";
import { AtlassianResourceWithProjects } from "../types";
import { getServerSession } from "@/lib/get-server-session";
import { BatchItem } from "drizzle-orm/batch";
import { makeKey, transformUserAccess, userAccessInsertSchema } from "@/db/helper/sync-helpers";
import { upsertAtlassianResource } from "@/db/queries/atlassian-resource-queries";
import { upsertJiraProject, upsertJiraIssueType } from "@/db/queries/jira-project-queries";
import { getUserAccess, insertUserAccess, deleteUserAccess } from "@/db/queries/user-access-queries";

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
  if (!session)
    throw new Error("No user session available");

  const userId = session.user.id;
  const batchQueries = [];

  // Upsert global resource, projects, issueTypes
  for (const resource of apiData) {
    batchQueries.push(upsertAtlassianResource(resource));

    for (const project of resource.projects) {
      batchQueries.push(upsertJiraProject(project, resource.id));

      for (const issue of project.issueTypes) {
        batchQueries.push(upsertJiraIssueType(issue, project.id));
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
  const existingAccess = await getUserAccess(userId);

  const existingKeys = new Set(existingAccess.map((row) => makeKey(row.cloudId, row.projectId)));
  const desiredKeys = new Set(parsedUserResourceAccessFromAPI.map((row) => makeKey(row.cloudId, row.projectId)));

  // Insert missing rows
  for (const row of parsedUserResourceAccessFromAPI) {
    const key = makeKey(row.cloudId, row.projectId);
    if (!existingKeys.has(key)) {
      batchQueries.push(insertUserAccess(row));
    }
  }

  // Delete stale rows
  for (const row of existingAccess) {
    const key = makeKey(row.cloudId, row.projectId);
    if (!desiredKeys.has(key)) {
      batchQueries.push(deleteUserAccess(row));
    }
  }

  await db.batch(batchQueries as unknown as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]]);
  return { synced: true };
}
