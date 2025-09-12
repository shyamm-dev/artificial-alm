import { db } from "@/db/drizzle";
import { jiraProject, jiraProjectIssueType } from "@/db/schema/jira-project-schema";
import { JiraProject, JiraIssueType } from "@/data-access-layer/types";
import { stripUndefined, transformProject, transformIssueType, jiraProjectInsertSchema, jiraIssueTypeInsertSchema } from "@/db/helper/sync-helpers";

export function upsertJiraProject(apiProject: JiraProject, cloudId: string) {
  const parsedProject = stripUndefined(jiraProjectInsertSchema.parse(transformProject(apiProject, cloudId)));
  return db.insert(jiraProject)
    .values(parsedProject)
    .onConflictDoUpdate({ target: jiraProject.id, set: parsedProject });
}

export function upsertJiraIssueType(issue: JiraIssueType, projectId: string) {
  const parsedIssue = stripUndefined(jiraIssueTypeInsertSchema.parse(transformIssueType(issue, projectId)));
  return db.insert(jiraProjectIssueType)
    .values(parsedIssue)
    .onConflictDoUpdate({ target: jiraProjectIssueType.id, set: parsedIssue });
}
