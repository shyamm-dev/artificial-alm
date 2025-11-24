import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { hasAtlassianAccount } from "@/lib/check-atlassian-account";
import { getStandaloneProjects } from "@/db/queries/standalone-project-queries";
import { getUserResourcesAndProjects } from "@/db/queries/user-project-queries";
import { getProjectTestCaseStats } from "@/db/queries/standalone-project-stats-queries";
import { getJiraProjectTestCaseStats } from "@/db/queries/jira-project-stats-queries";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const session = await getServerSession();
  if (!session)
    redirect("/login");

  const hasAtlassian = await hasAtlassianAccount();
  const standaloneProjects = await getStandaloneProjects(session.user.id);

  const projectsWithStats = await Promise.all(
    standaloneProjects.map(async (projectData) => ({
      ...projectData,
      stats: await getProjectTestCaseStats(projectData.project.id, session.user.id)
    }))
  );

  const jiraProjectsPromise = hasAtlassian
    ? getUserResourcesAndProjects(session.user.id).then(async (userAccessData) => {
        const projectsWithStats = await Promise.all(
          userAccessData
            .filter((access) => access.project)
            .map(async (access) => ({
              project: {
                ...access.project!,
                complianceStandards: access.project!.compliance?.frameworks || [],
              },
              stats: await getJiraProjectTestCaseStats(access.project!.id, session.user.id),
              customRuleCount: access.customRuleCount,
              siteName: access.resource.name,
              siteUrl: access.resource.url,
            }))
        );
        return projectsWithStats;
      })
    : Promise.resolve([]);

  return (
    <div className="px-4 lg:px-6">
      <ProjectsClient
        standaloneProjects={projectsWithStats}
        jiraProjectsPromise={jiraProjectsPromise}
        hasAtlassian={hasAtlassian}
      />
    </div>
  );
}
