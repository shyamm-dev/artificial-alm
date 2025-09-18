import { use } from "react"
import DataTable from "./data-table"
import { columns } from "./columns"
import { Pagination } from "./pagination"
import { SearchBar } from "./search-bar"
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
    string[]
  ]>
  searchParams: Record<string, string | string[] | undefined>
}

export function SchedulerTable({ dataPromise, searchParams }: SchedulerTableProps) {
  const [{ data, total }, projects, jobNames] = use(dataPromise)
  const { page, pageSize } = getPaginationParams(searchParams)

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="w-96">
          <SearchBar />
        </div>
        <StatusFilter />
        <ProjectFilter projects={projects} />
        <JobNameFilter jobNames={jobNames} />
        <ClearFilters />
      </div>
      <DataTable columns={columns} data={data} />
      <Pagination total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
