import { use } from "react"
import DataTable from "./data-table"
import { columns } from "./columns"
import { Pagination } from "./pagination"
import { getPaginationParams } from "@/lib/search-params"
import { getScheduledJobIssues } from "@/db/queries/scheduled-jobs-queries"

interface SchedulerTableProps {
  promise: Promise<Awaited<ReturnType<typeof getScheduledJobIssues>>>
  searchParams: Record<string, string | string[] | undefined>
}

export function SchedulerTable({ promise, searchParams }: SchedulerTableProps) {
  const { data, total } = use(promise)
  const { page, pageSize } = getPaginationParams(searchParams)

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data} />
      <Pagination total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
