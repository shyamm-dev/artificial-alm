"use client"

import { Suspense, useState } from "react";
import ProjectAccordian from "./project-accordian";
import { SyncButton } from "./sync-button";
import { JiraSearch } from "./jira-search";
import { getUserResourcesAndProjects } from "@/db/queries/user-project-queries";

type UserAccessData = Awaited<ReturnType<typeof getUserResourcesAndProjects>>;

interface JiraProjectsWrapperProps {
  sitesWithProjectsPromise: Promise<UserAccessData>;
}

export function JiraProjectsWrapper({ sitesWithProjectsPromise }: JiraProjectsWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground">Manage your Jira projects and compliance</p>
      </div>
      <div className="flex items-center justify-between mb-4">
        <JiraSearch onSearchChange={setSearchQuery} />
        <SyncButton />
      </div>
      <Suspense fallback={
        <div className="space-y-4">
          <div className="border rounded-lg p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
          </div>
        </div>
      }>
        <ProjectAccordian sitesWithProjectsPromise={sitesWithProjectsPromise} searchQuery={searchQuery} />
      </Suspense>
    </>
  );
}
