import { use } from "react"
import DataTable from "./data-table"
import { standaloneColumns } from "./standalone-columns"
import { Pagination } from "./pagination"
import { StandaloneRequirementSearchFilter } from "./standalone-requirement-search-filter"
import { StandaloneStatusFilter } from "./standalone-status-filter"
import { StandaloneProjectFilter } from "./standalone-project-filter"
import { JobNameFilter } from "./job-name-filter"
import { ClearFilters } from "./clear-filters"
import { getPaginationParams } from "@/lib/search-params"
import { getStandaloneScheduledJobRequirements } from "@/db/queries/standalone-scheduled-jobs-queries"

interface StandaloneTableProps {
  dataPromise: Promise<[
    Awaited<ReturnType<typeof getStandaloneScheduledJobRequirements>>,
    { id: string; name: string }[],
    string[],
    { requirementName: string }[]
  ]>
  searchParams: Record<string, string | string[] | undefined>
}

export function StandaloneTable({ dataPromise, searchParams }: StandaloneTableProps) {
  const [{ data, total }, projects, jobNames, requirements] = use(dataPromise)
  const { page, pageSize } = getPaginationParams(searchParams)

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="w-full lg:w-96">
          <StandaloneRequirementSearchFilter requirements={requirements} />
        </div>
        <div className="flex flex-wrap gap-2 lg:gap-4">
          <StandaloneStatusFilter />
          <StandaloneProjectFilter projects={projects} />
          <JobNameFilter jobNames={jobNames} />
          <ClearFilters />
        </div>
      </div>
      <DataTable columns={standaloneColumns} data={data} />
      <Pagination total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
