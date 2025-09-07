import { DataTable } from "@/components/data-table"

import data from "./data.json"

export default function Testcase() {
  return (
    <DataTable data={data} />
  )
}
