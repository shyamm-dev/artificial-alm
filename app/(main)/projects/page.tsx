import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";
import ProjectAccordian from "./project-accordian";
import { jiraClient, } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api";

export default async function ProjectsPage() {
  const sitesWithProjects = await jiraClient.getSyncedAtlassianResourceWithProjects();
  if (sitesWithProjects.error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">Error fetching Jira sites/projects : {sitesWithProjects.error?.message}</p>
      </div>
    );
  }

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
        <ProjectAccordian sitesData={sitesWithProjects.data} />
      </div>
    </>
  );
}
