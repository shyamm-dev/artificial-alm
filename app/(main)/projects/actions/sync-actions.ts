"use server";

import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/get-server-session";
import { upsertProjectCompliance } from "@/db/queries/user-project-queries";
import { ComplianceFramework } from "@/constants/shared-constants";
import { tryCatch } from "@/lib/try-catch";

export async function syncAtlassianResource() {
  const result = await jiraClient.syncAtlassianResourceAndJiraProjects();

  if (result.error) {
    console.error("Failed to sync Atlassian resources:", result.error);
    return { success: false, message: "Failed to sync Atlassian resources." };
  }

  revalidatePath("/projects");
  return { success: true, message: "Atlassian resources synced successfully!" };
}

export async function saveProjectCompliance(projectId: string,selectedFrameworks: ComplianceFramework[]) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const result = await tryCatch(
    upsertProjectCompliance({
      projectId,
      frameworks: selectedFrameworks,
      lastUpdatedById: user.id,
      lastUpdatedByName: user.name || null,
      lastUpdatedByEmail: user.email || null,
      lastUpdatedByAvatar: user.image || null,
    })
  );

  if (result.error) {
    console.error("Failed to save compliance standards:", result.error);
    return { success: false, message: "Failed to save compliance standards." };
  }

  revalidatePath("/projects");
  return { success: true, message: "Compliance standards saved successfully!" };
}
