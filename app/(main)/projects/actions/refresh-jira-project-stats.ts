"use server"

import { getServerSession } from "@/lib/get-server-session";
import { getJiraProjectTestCaseStats } from "@/db/queries/jira-project-stats-queries";

export async function refreshJiraProjectStats(projectId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const stats = await getJiraProjectTestCaseStats(projectId, session.user.id);
    return { success: true, stats };
  } catch (error) {
    console.error("Error refreshing Jira project stats:", error);
    return { success: false, message: "Failed to refresh stats" };
  }
}
