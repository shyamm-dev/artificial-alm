import ProjectAccordian from "./project-accordian";
import { SyncButton } from "../../../components/sync-button";
import { Suspense } from "react";
import { getServerSession } from "@/lib/get-server-session";
import { getUserResourcesAndProjects } from "@/db/queries/user-project-queries";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await getServerSession();
  if (!session)
    redirect("/login");

  const sitesWithProjectsPromise = getUserResourcesAndProjects(session.user.id);

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
