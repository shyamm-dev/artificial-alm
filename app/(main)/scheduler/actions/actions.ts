"use server"

import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api"
import { hasAccessToResource } from "@/db/queries/user-project-queries";
import { getServerSession } from "@/lib/get-server-session"
import { buildJQL } from "@/lib/jql-builder"
import { JiraIssueSearchActionArgs } from "./actions-schema";

export async function searchJiraIssues(args: JiraIssueSearchActionArgs) {
  const session = await getServerSession();
  if (!session)
    throw new Error("No user session !");

  const hasAccess = await hasAccessToResource(session.user.id, args.cloudId, args.projectId);
  if (!hasAccess)
    throw new Error("Not Authorized to access this project !");

  const jql = buildJQL(args.projectId, args.filters);
  console.log("JQL: ", jql);

  const result = await jiraClient.searchJiraIssues(args.cloudId, jql, ["summary", "issuetype", "description"]);

  if (result.error) {
    throw result.error
  }

  return result.data
}
