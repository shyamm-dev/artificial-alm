import { DataTable } from "@/components/data-table"

import data from "./data.json"

export default function SchedulerPage() {
  return (
    <DataTable data={data} />
  )
}
