import { use } from "react"
import DataTable from "./data-table"
import { columns } from "./columns"
import { Pagination } from "./pagination"
import { IssueSearchFilter } from "./issue-search-filter"
import { StatusFilter } from "./status-filter"
import { ProjectFilter } from "./project-filter"
import { JobNameFilter } from "./job-name-filter"
import { ClearFilters } from "./clear-filters"
import { getPaginationParams } from "@/lib/search-params"
import { getScheduledJobIssues } from "@/db/queries/scheduled-jobs-queries"

interface SchedulerTableProps {
  dataPromise: Promise<[
    Awaited<ReturnType<typeof getScheduledJobIssues>>,
    { id: string; name: string; key: string; avatarUrl: string | null }[],
    string[],
    { issueKey: string; summary: string; issueTypeIconUrl: string | null; issueTypeName: string | null }[]
  ]>
  searchParams: Record<string, string | string[] | undefined>
}

export function SchedulerTable({ dataPromise, searchParams }: SchedulerTableProps) {
  const [{ data, total }, projects, jobNames, issues] = use(dataPromise)
  const { page, pageSize } = getPaginationParams(searchParams)

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="w-full lg:w-96">
          <IssueSearchFilter issues={issues} />
        </div>
        <div className="flex flex-wrap gap-2 lg:gap-4">
          <StatusFilter />
          <ProjectFilter projects={projects} />
          <JobNameFilter jobNames={jobNames} />
          <ClearFilters />
        </div>
      </div>
      <DataTable columns={columns} data={data} />
      <Pagination total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
