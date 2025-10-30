import { getStandaloneProjects } from "@/db/queries/standalone-project-queries";
import { StandaloneProjectsWrapper } from "./standalone-projects";

interface StandaloneProjectsServerProps {
  userId: string;
}

export async function StandaloneProjectsServer({ userId }: StandaloneProjectsServerProps) {
  const projectsData = await getStandaloneProjects(userId);

  return <StandaloneProjectsWrapper projectsData={projectsData} />;
}
