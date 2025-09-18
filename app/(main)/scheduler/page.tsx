import * as React from "react"
import { Button } from "@/components/ui/button"
import { getServerSession } from "@/lib/get-server-session"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SchedulerTable } from "./scheduler-table"
import { SchedulerSkeleton } from "./scheduler-skeleton"
import { getScheduledJobIssues, getUserProjects, getJobNames } from "@/db/queries/scheduled-jobs-queries"
import { getPaginationParams } from "@/lib/search-params"


interface SchedulerPageProps {
  searchParams: Promise<{ page?: string; per_page?: string; search?: string; sortBy?: string; sortOrder?: string; status?: string; projectId?: string; jobName?: string }>
}

export default async function SchedulerPage({ searchParams }: SchedulerPageProps) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const { page, pageSize, search, sortBy, sortOrder, status, projectId, jobName } = getPaginationParams(params);
  const dataPromise = Promise.all([
    getScheduledJobIssues(session.user.id, { page, pageSize }, { search, sortBy, sortOrder, status, projectId, jobName }),
    getUserProjects(session.user.id),
    getJobNames(session.user.id)
  ]);

  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Scheduled Job Issues</h1>
        <Link href="/scheduler/new">
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Job
          </Button>
        </Link>
      </div>
      <div className="mt-8">
        <React.Suspense fallback={<SchedulerSkeleton />}>
          <SchedulerTable dataPromise={dataPromise} searchParams={params} />
        </React.Suspense>
      </div>
    </div>
  )
}
