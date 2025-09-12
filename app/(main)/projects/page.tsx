import ProjectAccordian from "./project-accordian";
import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api";
import { SyncButton } from "../../../components/sync-button";
import { syncAtlassianResource } from "./actions/sync-actions";

export default async function ProjectsPage() {
  const sitesWithProjects = await jiraClient.getAtlassianResourceWithProjects();
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
            <form action={syncAtlassianResource}>
              <SyncButton />
            </form>
          </div>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <ProjectAccordian sitesData={sitesWithProjects.data} />
      </div>
    </>
  );
}
