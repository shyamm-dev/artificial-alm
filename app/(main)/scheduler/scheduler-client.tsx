"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FolderIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { RefreshButton } from "./refresh-button"
import { StandaloneProjectsProgress } from "./standalone-projects-progress"
import { JiraProjectsProgress } from "./jira-projects-progress"
import { SchedulerSkeleton } from "./scheduler-skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SchedulerClientProps {
  hasAtlassian: boolean
  hasStandaloneProjects: boolean
  standaloneDataPromise?: Promise<[
    { data: { id: string; requirementName: string; status: "pending" | "in_progress" | "completed" | "failed"; reason: string | null; jobName: string; projectName: string; createdAt: string; updatedAt: string }[]; total: number },
    { id: string; name: string }[],
    string[],
    { requirementName: string }[]
  ]>
  jiraDataPromise: Promise<[
    { data: { id: string; issueKey: string; summary: string; status: "pending" | "in_progress" | "completed" | "failed" | "stale" | "deployed_to_jira"; reason: string | null; jobName: string; issueTypeIconUrl: string | null; issueTypeName: string; createdAt: string; updatedAt: string }[]; total: number },
    { id: string; name: string; key: string; avatarUrl: string | null }[],
    string[],
    { issueKey: string; summary: string; issueTypeIconUrl: string | null; issueTypeName: string | null }[]
  ]>
  searchParams: Record<string, string | string[] | undefined>
}

export function SchedulerClient({
  hasAtlassian,
  hasStandaloneProjects,
  standaloneDataPromise,
  jiraDataPromise,
  searchParams
}: SchedulerClientProps) {
  const [workspace, setWorkspace] = useState<"standalone" | "jira" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedSource = localStorage.getItem('selectedSource') as "standalone" | "jira" | null
    setWorkspace(savedSource)
    setIsLoading(false)

    const handleStorageChange = () => {
      // Clear filters when workspace changes
      if (typeof window !== 'undefined') {
        window.location.href = '/scheduler'
      }
    }

    window.addEventListener('workspace-changed', handleStorageChange)
    return () => {
      window.removeEventListener('workspace-changed', handleStorageChange)
    }
  }, [])

  const showStandalone = workspace === "standalone"
  const showJira = workspace === "jira"

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-4">
          <FolderIcon className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">No Workspace Selected</h3>
            <p className="text-sm text-muted-foreground">Select a workspace from the header to view progress</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Track Progress</h1>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Link href="/scheduler/new">
            <Button size="sm" disabled={showStandalone && !hasStandaloneProjects}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Job
            </Button>
          </Link>
        </div>
      </div>

      {showStandalone && (
        <>
          {hasStandaloneProjects && standaloneDataPromise ? (
            <Suspense fallback={<SchedulerSkeleton />}>
              <StandaloneProjectsProgress hasProjects={hasStandaloneProjects} dataPromise={standaloneDataPromise} searchParams={searchParams} />
            </Suspense>
          ) : (
            <StandaloneProjectsProgress hasProjects={hasStandaloneProjects} />
          )}
        </>
      )}

      {showJira && (
        <>
          {hasAtlassian ? (
            <Suspense fallback={<SchedulerSkeleton />}>
              <JiraProjectsProgress dataPromise={jiraDataPromise} searchParams={searchParams} />
            </Suspense>
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
        </>
      )}
    </>
  )
}
