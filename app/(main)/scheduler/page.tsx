import * as React from "react"
import { Button } from "@/components/ui/button"
import { getServerSession } from "@/lib/get-server-session"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ProgressTabNavigation } from "./progress-tab-navigation"
import { JiraProjectsProgress } from "./jira-projects-progress"
import { StandaloneProjectsProgress } from "./standalone-projects-progress"
import { SchedulerSkeleton } from "./scheduler-skeleton"
import { getScheduledJobIssues, getUserProjects, getJobNames, getIssueKeysAndSummaries } from "@/db/queries/scheduled-jobs-queries"
import { getStandaloneScheduledJobRequirements, getStandaloneUserProjects, getStandaloneJobNames, getStandaloneRequirementNames } from "@/db/queries/standalone-scheduled-jobs-queries"
import { getPaginationParams } from "@/lib/search-params"
import { hasAtlassianAccount } from "@/lib/check-atlassian-account"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStandaloneProjects } from "@/db/queries/standalone-project-queries"


interface SchedulerPageProps {
  searchParams: Promise<{ page?: string; per_page?: string; search?: string; sortBy?: string; sortOrder?: string; status?: string; projectId?: string; jobName?: string; tab?: string }>
}

export default async function SchedulerPage({ searchParams }: SchedulerPageProps) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const hasAtlassian = await hasAtlassianAccount();
  const standaloneProjects = await getStandaloneProjects(session.user.id);
  const params = await searchParams;
  const tab = params.tab || "standalone";
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
      <h1 className="text-2xl font-bold mb-6">Track Progress</h1>

      <Tabs value={tab}>
        <div className="flex items-center justify-between">
          <ProgressTabNavigation />
          <Link href="/scheduler/new">
            <Button size="sm" disabled={tab === "standalone" && !hasStandaloneProjects}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Job
            </Button>
          </Link>
        </div>

        <TabsContent value="standalone" className="mt-6">
          {hasStandaloneProjects && standaloneDataPromise ? (
            <React.Suspense fallback={<SchedulerSkeleton />}>
              <StandaloneProjectsProgress hasProjects={hasStandaloneProjects} dataPromise={standaloneDataPromise} searchParams={params} />
            </React.Suspense>
          ) : (
            <StandaloneProjectsProgress hasProjects={hasStandaloneProjects} />
          )}
        </TabsContent>

        <TabsContent value="jira" className="mt-6">
          {hasAtlassian ? (
            <React.Suspense fallback={<SchedulerSkeleton />}>
              <JiraProjectsProgress dataPromise={jiraDataPromise} searchParams={params} />
            </React.Suspense>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Track testcase generation progress for requirements available in Jira projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Checkout Atlassian integration to use this feature.
                </p>
                <Link href="/integrations/atlassian">
                  <Button>Go to Integrations</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
