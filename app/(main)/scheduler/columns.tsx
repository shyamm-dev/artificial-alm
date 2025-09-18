"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ScheduledJobIssueStatus } from "@/constants/shared-constants"

export type ScheduledJobIssue = {
  id: string
  issueKey: string
  summary: string
  status: ScheduledJobIssueStatus
  jobName: string
  issueTypeIconUrl: string | null
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<ScheduledJobIssue>[] = [
  {
    accessorKey: "issueKey",
    header: "Issue Key",
  },
  {
    accessorKey: "summary",
    header: "Summary",
  },
  {
    accessorKey: "jobName",
    header: "Job Name",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const value = row.getValue("createdAt")
      const date = new Date(value as string)
      const formattedDate = date.toLocaleDateString("en-US")
      const formattedTime = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })
      return <div>{formattedDate} {formattedTime}</div>
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const value = row.getValue("updatedAt")
      const date = new Date(value as string)
      const formattedDate = date.toLocaleDateString("en-US")
      const formattedTime = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })
      return <div>{formattedDate} {formattedTime}</div>
    },
  },
]
