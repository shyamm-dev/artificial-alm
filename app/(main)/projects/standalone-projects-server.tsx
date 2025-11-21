import { getStandaloneProjects } from "@/db/queries/standalone-project-queries";
import { getProjectTestCaseStats } from "@/db/queries/standalone-project-stats-queries";
import { StandaloneProjectsWrapper } from "./standalone-projects";

interface StandaloneProjectsServerProps {
  userId: string;
}

export async function StandaloneProjectsServer({ userId }: StandaloneProjectsServerProps) {
  const standaloneProjects = await getStandaloneProjects(userId);
  
  const projectsData = await Promise.all(
    standaloneProjects.map(async (projectData) => ({
      ...projectData,
      stats: await getProjectTestCaseStats(projectData.project.id, userId)
    }))
  );

  return <StandaloneProjectsWrapper projectsData={projectsData} />;
}
