"use server";

import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api";
import { tryCatch } from "@/lib/try-catch";
import { revalidatePath } from "next/cache";

export async function syncAtlassianResource() {
  const syncResponse = tryCatch(jiraClient.syncAtlassianResourceAndJiraProjects());
  revalidatePath("/projects");
}
