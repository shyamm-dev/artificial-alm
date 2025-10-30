import { db } from "@/db/drizzle";
import { standaloneProject, standaloneProjectCompliance, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateStandaloneProject(projectId: string, name: string, description: string | null) {
  await db
    .update(standaloneProject)
    .set({
      name,
      description,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(standaloneProject.id, projectId));
}

export async function getStandaloneProjects(userId: string) {
  return await db
    .select({
      project: standaloneProject,
      compliance: standaloneProjectCompliance,
    })
    .from(standaloneProject)
    .leftJoin(
      standaloneProjectCompliance,
      eq(standaloneProject.id, standaloneProjectCompliance.projectId)
    )
    .where(eq(standaloneProject.userId, userId));
}

export async function createDefaultStandaloneProject(userId: string) {
  try {
    const [userRecord] = await db
      .select({ onboarded: user.onboarded })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userRecord || userRecord.onboarded) {
      return;
    }

    await db.batch([
      db.insert(standaloneProject).values({
        id: crypto.randomUUID(),
        name: "Default Project",
        description: "Configure compliance for this project and all test cases generated under this project will have the compliance applied to them",
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      db.update(user).set({ onboarded: true }).where(eq(user.id, userId))
    ]);
  } catch (error) {
    console.error("Error creating default project:", error);
  }
}
