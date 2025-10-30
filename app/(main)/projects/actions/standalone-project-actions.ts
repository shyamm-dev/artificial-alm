"use server"

import { db } from "@/db/drizzle";
import { standaloneProjectCompliance, standaloneProject } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ComplianceFramework } from "@/constants/shared-constants";
import { revalidatePath } from "next/cache";
import { updateStandaloneProject } from "@/db/queries/standalone-project-queries";

export async function saveStandaloneProjectSettings(
  projectId: string,
  name: string,
  description: string | null,
  frameworks: ComplianceFramework[]
) {
  try {
    await updateStandaloneProject(projectId, name, description);

    const existing = await db
      .select()
      .from(standaloneProjectCompliance)
      .where(eq(standaloneProjectCompliance.projectId, projectId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(standaloneProjectCompliance)
        .set({
          frameworks,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(standaloneProjectCompliance.projectId, projectId));
    } else {
      await db.insert(standaloneProjectCompliance).values({
        projectId,
        frameworks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    revalidatePath("/projects");
    return { success: true, message: "Project settings saved successfully" };
  } catch (error) {
    console.error("Error saving project settings:", error);
    return { success: false, message: "Failed to save project settings" };
  }
}

export async function saveStandaloneProjectCompliance(projectId: string, frameworks: ComplianceFramework[]) {
  try {
    const existing = await db
      .select()
      .from(standaloneProjectCompliance)
      .where(eq(standaloneProjectCompliance.projectId, projectId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(standaloneProjectCompliance)
        .set({
          frameworks,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(standaloneProjectCompliance.projectId, projectId));
    } else {
      await db.insert(standaloneProjectCompliance).values({
        projectId,
        frameworks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    revalidatePath("/projects");
    return { success: true, message: "Compliance settings saved successfully" };
  } catch (error) {
    console.error("Error saving compliance:", error);
    return { success: false, message: "Failed to save compliance settings" };
  }
}

export async function deleteStandaloneProject(projectId: string) {
  try {
    await db.delete(standaloneProject).where(eq(standaloneProject.id, projectId));
    revalidatePath("/projects");
    return { success: true, message: "Project deleted successfully" };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, message: "Failed to delete project" };
  }
}
