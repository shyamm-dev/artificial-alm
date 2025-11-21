import * as React from "react"
import { getServerSession } from "@/lib/get-server-session"
import { redirect } from "next/navigation"
import { SchedulerClient } from "./scheduler-client"
import { getScheduledJobIssues, getUserProjects, getJobNames, getIssueKeysAndSummaries } from "@/db/queries/scheduled-jobs-queries"
import { getStandaloneScheduledJobRequirements, getStandaloneUserProjects, getStandaloneJobNames, getStandaloneRequirementNames } from "@/db/queries/standalone-scheduled-jobs-queries"
import { getPaginationParams } from "@/lib/search-params"
import { hasAtlassianAccount } from "@/lib/check-atlassian-account"
import { getStandaloneProjects } from "@/db/queries/standalone-project-queries"


interface SchedulerPageProps {
  searchParams: Promise<{ page?: string; per_page?: string; search?: string; sortBy?: string; sortOrder?: string; status?: string; projectId?: string; jobName?: string }>
}

export default async function SchedulerPage({ searchParams }: SchedulerPageProps) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const hasAtlassian = await hasAtlassianAccount();
  const standaloneProjects = await getStandaloneProjects(session.user.id);
  const params = await searchParams;
  const hasStandaloneProjects = standaloneProjects.length > 0;
  const { page, pageSize, search, sortBy, sortOrder, status, projectId, jobName } = getPaginationParams(params);

  const jiraDataPromise = Promise.all([
    getScheduledJobIssues(session.user.id, { page, pageSize }, { search, sortBy, sortOrder, status, projectId, jobName }),
    getUserProjects(session.user.id),
    getJobNames(session.user.id),
    getIssueKeysAndSummaries(session.user.id)
  ]);

  const standaloneDataPromise = hasStandaloneProjects ? Promise.all([
    getStandaloneScheduledJobRequirements(session.user.id, { page, pageSize }, { search, sortBy, sortOrder, status, projectId, jobName }),
    getStandaloneUserProjects(session.user.id),
    getStandaloneJobNames(session.user.id),
    getStandaloneRequirementNames(session.user.id)
  ]) : undefined;

  return (
    <div className="px-4 lg:px-6">
      <SchedulerClient
        hasAtlassian={hasAtlassian}
        hasStandaloneProjects={hasStandaloneProjects}
        standaloneDataPromise={standaloneDataPromise}
        jiraDataPromise={jiraDataPromise}
        searchParams={params}
      />
    </div>
  )
}
