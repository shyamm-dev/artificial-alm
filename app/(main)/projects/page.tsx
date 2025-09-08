import { getAccessibleResources, getPaginatedJiraProjects } from "@/lib/data-access-layer/atlassian-api/jira";
import { JiraAccessibleResource, JiraProject } from "@/lib/data-access-layer/atlassian-api/types";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";
import ProjectAccordian from "./project-accordian";

export interface SiteWithProjects extends JiraAccessibleResource {
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
    <>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              something goes here
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="flex items-center gap-2">
              <IconRefresh className="h-4 w-4" />
              Sync Changes
            </Button>
          </div>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <ProjectAccordian sitesData={sitesWithProjects} />
      </div>
    </>
  );
}
