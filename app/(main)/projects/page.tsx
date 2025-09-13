import ProjectAccordian from "./project-accordian";
import { jiraClient } from "@/data-access-layer/atlassian-cloud-api/jira-cloud-api";
import { SyncButton } from "../../../components/sync-button";
import { Suspense } from "react";

export default async function ProjectsPage() {
  const sitesWithProjectsPromise = jiraClient.getAtlassianResourceWithProjects();

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
            <SyncButton />
          </div>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <Suspense fallback={<div>Fetching your sites and projects...!</div>}>
          <ProjectAccordian sitesWithProjectsPromise={sitesWithProjectsPromise} />
        </Suspense>
      </div>
    </>
  );
}
