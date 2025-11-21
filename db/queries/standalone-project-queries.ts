import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { standaloneProject, standaloneProjectCompliance, user } from "../schema";

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
        description: "This is a comprehensive default project created to help you get started with test case management and compliance tracking. Configure compliance standards for this project and all test cases generated under this project will automatically have the compliance requirements applied to them. You can customize the project name, description, and compliance standards at any time through the settings panel. This project serves as a template to demonstrate how you can organize your testing efforts across different compliance frameworks including GDPR, SOC2, ISO 27001, and HIPAA.",
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
