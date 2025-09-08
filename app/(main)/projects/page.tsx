import { getAccessibleResources, getPaginatedJiraProjects } from "@/lib/data-access-layer/atlassian-api/jira";
import { JiraAccessibleResource, JiraProject } from "@/lib/data-access-layer/atlassian-api/types";

interface SiteWithProjects extends JiraAccessibleResource {
  projects: JiraProject[];
}

export default async function ProjectsPage() {
  const resourcesResult = await getAccessibleResources();
  if (resourcesResult.error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">Error fetching Jira sites: {resourcesResult.error?.message}</p>
      </div>
    );
  }

  const sitesWithProjects: SiteWithProjects[] = await Promise.all(
    resourcesResult.data.map(async (site) => {
      const projectsResult = await getPaginatedJiraProjects(site.id);
      return {
        ...site,
        projects: projectsResult.data?.values || [],
      };
    })
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      Project accordian goes here
    </div>
  );
}
