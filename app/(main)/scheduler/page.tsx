"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw } from "lucide-react"
import { SCHEDULED_JOB_ISSUE_STATUS } from "@/constants/shared-constants"

interface ScheduledJobIssue {
  id: string
  issueKey: string
  summary: string
  status: string
  jobName: string
  issueTypeIconUrl: string
  createdAt: Date
  updatedAt: Date
}

interface Filters {
  status?: string
  summary?: string
  issueKey?: string
  jobName?: string
  issueTypeId?: string
  projectId?: string
}

export default function SchedulerPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filters, setFilters] = useState<Filters>({})

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["scheduledJobIssues", page, pageSize, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
      })
      
      const response = await fetch(`/api/scheduler/list?${params}`)
      if (!response.ok) throw new Error("Failed to fetch")
      return response.json() as Promise<{ data: ScheduledJobIssue[], total: number }>
    },
    refetchInterval: 10000
  })

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Scheduled Job Issues</h1>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? undefined : value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {SCHEDULED_JOB_ISSUE_STATUS.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Summary"
            value={filters.summary || ""}
            onChange={(e) => setFilters(prev => ({ ...prev, summary: e.target.value || undefined }))}
          />

          <Input
            placeholder="Issue Key"
            value={filters.issueKey || ""}
            onChange={(e) => setFilters(prev => ({ ...prev, issueKey: e.target.value || undefined }))}
          />

          <Input
            placeholder="Job Name"
            value={filters.jobName || ""}
            onChange={(e) => setFilters(prev => ({ ...prev, jobName: e.target.value || undefined }))}
          />

          <Input
            placeholder="Issue Type ID"
            value={filters.issueTypeId || ""}
            onChange={(e) => setFilters(prev => ({ ...prev, issueTypeId: e.target.value || undefined }))}
          />

          <Input
            placeholder="Project ID"
            value={filters.projectId || ""}
            onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value || undefined }))}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="container mx-auto p-6">Loading...</div>
      ) : (
        <DataTable 
          data={data?.data?.map((issue, index) => ({
            id: index + 1,
            header: issue.issueKey,
            type: issue.status,
            status: issue.status,
            target: issue.summary,
            limit: issue.jobName,
            reviewer: new Date(issue.createdAt).toLocaleDateString(),
            iconUrl: issue.issueTypeIconUrl
          })) || []} 
        />
      )}
    </>
  )
}