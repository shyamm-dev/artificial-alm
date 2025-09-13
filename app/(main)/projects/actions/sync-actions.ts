"use server";

import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api";
import { revalidatePath } from "next/cache";

export async function syncAtlassianResource() {
  const result = await jiraClient.syncAtlassianResourceAndJiraProjects();

  if (result.error) {
    console.error("Failed to sync Atlassian resources:", result.error);
    return { success: false, message: "Failed to sync Atlassian resources." };
  }

  revalidatePath("/projects");
  return { success: true, message: "Atlassian resources synced successfully!" };
}
