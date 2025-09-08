import { getAccessibleResources } from "@/lib/data-access-layer/atlassian-api/jira";
import { getPaginatedJiraProjects } from "@/lib/data-access-layer/atlassian-api/jira";
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

  const sitesWithProjects: SiteWithProjects[] = [];

  for (const site of resourcesResult.data) {
    const projectsResult = await getPaginatedJiraProjects(site.id);
    sitesWithProjects.push({
      ...site,
      projects: projectsResult.data?.values || [],
    });
  }

  console.log(sitesWithProjects);
}
