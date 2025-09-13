import { db } from "@/db/drizzle";
import { jiraProjectCompliance } from "@/db/schema/jira-project-schema";
import { stripUndefined } from "@/db/helper/sync-helpers";
import { createInsertSchema } from "drizzle-zod";

const jiraProjectComplianceInsertSchema = createInsertSchema(jiraProjectCompliance);

export function upsertProjectCompliance(complianceData: typeof jiraProjectCompliance.$inferInsert) {
  const parsedData = stripUndefined(jiraProjectComplianceInsertSchema.parse(complianceData));
  return db.insert(jiraProjectCompliance)
    .values(parsedData)
    .onConflictDoUpdate({ target: jiraProjectCompliance.projectId, set: parsedData });
}


export function getUserResourcesAndProjects(userId: string) {
  return db.query.userAtlassianProjectAccess.findMany({
    where: (u, { eq }) => eq(u.userId, userId),
    with: {
      resource: true,
      project: {
        with: {
          issueTypes: true,
          compliance: true
        }
      }
    }
  });
}
