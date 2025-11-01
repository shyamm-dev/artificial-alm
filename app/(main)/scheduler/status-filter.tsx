"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { SCHEDULED_JOB_ISSUE_STATUS, ScheduledJobIssueStatus } from "@/constants/shared-constants"
import { Clock, Zap, CheckCircle, XCircle, HelpCircle, Archive } from "lucide-react"

export function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get("status") || ""

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("status", value)
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const selectedStatus = SCHEDULED_JOB_ISSUE_STATUS.find(s => s === currentStatus)
  const selectedStatusInfo = selectedStatus ? getStatusIndicator(selectedStatus) : null

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-full sm:w-40">
        <SelectValue placeholder="Select status...">
          {selectedStatusInfo && (
            <div className="flex items-center gap-2">
              {selectedStatusInfo.icon}
              {selectedStatusInfo.text}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SCHEDULED_JOB_ISSUE_STATUS.map((status) => {
          const { text, icon } = getStatusIndicator(status)
          return (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                {icon}
                {text}
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

const getStatusIndicator = (status: ScheduledJobIssueStatus) => {
  switch (status) {
    case "pending":
      return { text: "Pending", icon: <Clock className="h-3 w-3 text-yellow-600" /> };
    case "in_progress":
      return { text: "Running", icon: <Zap className="h-3 w-3 text-blue-600" /> };
    case "completed":
      return { text: "Success", icon: <CheckCircle className="h-3 w-3 text-green-600" /> };
    case "failed":
      return { text: "Failed", icon: <XCircle className="h-3 w-3 text-red-600" /> };
    case "deployed_to_jira":
      return { text: "Deployed", icon: <CheckCircle className="h-3 w-3 text-purple-600" /> };
    case "stale":
      return { text: "Stale", icon: <Archive className="h-3 w-3 text-gray-500" /> };
    default:
      return { text: "Unknown", icon: <HelpCircle className="h-3 w-3 text-gray-600" /> };
  }
};