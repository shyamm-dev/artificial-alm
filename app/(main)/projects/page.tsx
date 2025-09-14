import ProjectAccordian from "./project-accordian";
import { SyncButton } from "./sync-button";
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
          <h1 className="text-2xl font-bold">Your Projects</h1>
          <SyncButton />
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <Suspense fallback={
          <div className="space-y-4">
            <div className="mb-4">
              <div className="h-10 bg-muted rounded-md animate-pulse"></div>
            </div>
            <div className="border rounded-lg p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        }>
          <ProjectAccordian sitesWithProjectsPromise={sitesWithProjectsPromise} />
        </Suspense>
      </div>
    </>
  );
}
