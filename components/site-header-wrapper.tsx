import { getServerSession } from "@/lib/get-server-session";
import { createDefaultStandaloneProject, getStandaloneProjects } from "@/db/queries/standalone-project-queries";
import { getUserResourcesAndProjects } from "@/db/queries/user-project-queries";
import { hasAtlassianAccount } from "@/lib/check-atlassian-account";
import { SiteHeader } from "./site-header";

export async function SiteHeaderWrapper() {
  const session = await getServerSession();
  
  if (!session) {
    return <SiteHeader />;
  }

  await createDefaultStandaloneProject(session.user.id);
  const standaloneProjects = await getStandaloneProjects(session.user.id);
  const hasAtlassian = await hasAtlassianAccount();
  const jiraProjects = hasAtlassian ? await getUserResourcesAndProjects(session.user.id) : [];

  const allProjects = [
    ...standaloneProjects.map(p => ({
      id: p.project.id,
      name: p.project.name,
      source: "standalone" as const
    })),
    ...jiraProjects
      .filter(access => access.project)
      .map(access => ({
        id: access.project!.id,
        name: access.project!.name,
        source: "jira" as const
      }))
  ];

  return <SiteHeader projects={allProjects} hasAtlassian={hasAtlassian} />;
}
