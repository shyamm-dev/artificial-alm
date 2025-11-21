"use client"

import { useState, useEffect } from "react";
import { UnifiedSearch } from "./unified-search";
import { CreateProjectDialog } from "./create-project-dialog";
import { SyncButton } from "./sync-button";

import { StandaloneProjectsClient } from "./standalone-projects-client";
import { standaloneProject, standaloneProjectCompliance } from "@/db/schema";
import { Suspense } from "react";
import ProjectAccordian from "./project-accordian";
import { jiraProject } from "@/db/schema/jira-project-schema";
import { FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JiraIntegrationBanner } from "./jira-integration-banner";
import { Skeleton } from "@/components/ui/skeleton";

type StandaloneProjectData = {
  project: typeof standaloneProject.$inferSelect;
  compliance: typeof standaloneProjectCompliance.$inferSelect | null;
  stats: {
    success: number;
    failed: number;
    inProgress: number;
    pending: number;
    total: number;
  };
};

type JiraProjectWithStats = {
  project: typeof jiraProject.$inferSelect & { complianceStandards: string[] }
  stats: {
    success: number
    failed: number
    inProgress: number
    pending: number
    total: number
  }
  siteName: string
  siteUrl: string
}

interface ProjectsClientProps {
  standaloneProjects: StandaloneProjectData[];
  jiraProjectsPromise: Promise<JiraProjectWithStats[]>;
  hasAtlassian: boolean;
}

export function ProjectsClient({ standaloneProjects, jiraProjectsPromise, hasAtlassian }: ProjectsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [workspace, setWorkspace] = useState<"standalone" | "jira" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSource = localStorage.getItem('selectedSource') as "standalone" | "jira" | null;
    setWorkspace(savedSource);
    setIsLoading(false);

    const handleStorageChange = () => {
      const newSource = localStorage.getItem('selectedSource') as "standalone" | "jira" | null;
      setWorkspace(newSource);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('workspace-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('workspace-changed', handleStorageChange);
    };
  }, []);

  const showStandalone = workspace === "standalone";
  const showJira = workspace === "jira";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-4">
          <FolderIcon className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">No Workspace Selected</h3>
            <p className="text-sm text-muted-foreground">Select a workspace from the header to view projects</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showStandalone && (
        <div className="flex items-center gap-2 mb-6">
          <FolderIcon className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Standalone Projects</h2>
        </div>
      )}

      {showJira && (
        <div className="flex items-center gap-2 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="h-6 w-6">
            <path d="M108.023 16H61.805c0 11.52 9.324 20.848 20.847 20.848h8.5v8.226c0 11.52 9.328 20.848 20.848 20.848V19.977A3.98 3.98 0 00108.023 16zm0 0" fill="currentColor" />
            <path d="M85.121 39.04H38.902c0 11.519 9.325 20.847 20.844 20.847h8.504v8.226c0 11.52 9.328 20.848 20.848 20.848V43.016a3.983 3.983 0 00-3.977-3.977zm0 0" fill="currentColor" />
            <path d="M62.219 62.078H16c0 11.524 9.324 20.848 20.848 20.848h8.5v8.23c0 11.52 9.328 20.844 20.847 20.844V66.059a3.984 3.984 0 00-3.976-3.98zm0 0" fill="currentColor" />
          </svg>
          <h2 className="text-2xl font-semibold">Jira Projects</h2>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <UnifiedSearch value={searchQuery} onChange={setSearchQuery} />
        {showStandalone && <CreateProjectDialog />}
        {showJira && hasAtlassian && <SyncButton />}
      </div>

      {showStandalone && (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">TOTAL :</span> {standaloneProjects.length} {standaloneProjects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
      )}

      {showStandalone && !hasAtlassian && <JiraIntegrationBanner />}

      {showStandalone && (
        <div>
          {standaloneProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <FolderIcon className="h-16 w-16 text-muted-foreground" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No projects yet</h3>
                <p className="text-sm text-muted-foreground">Create your first project to get started</p>
              </div>
              <CreateProjectDialog triggerButton={<Button>+ Create Project</Button>} />
            </div>
          ) : (
            <StandaloneProjectsClient projectsData={standaloneProjects} searchQuery={searchQuery} />
          )}
        </div>
      )}

      {showJira && hasAtlassian && (
        <div>
          <Suspense fallback={
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
            </div>
          }>
            <ProjectAccordian projectsWithStatsPromise={jiraProjectsPromise} searchQuery={searchQuery} showOrgCount />
          </Suspense>
        </div>
      )}
    </>
  );
}
