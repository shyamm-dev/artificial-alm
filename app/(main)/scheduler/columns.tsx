"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ScheduledJobIssueStatus } from "@/constants/shared-constants"
import Image from "next/image"
import { Clock, Zap, CheckCircle, XCircle, HelpCircle, Archive } from "lucide-react"
import { useState, useEffect } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SortableHeader } from "./sortable-header"

export type ScheduledJobIssue = {
  id: string
  issueKey: string
  summary: string
  status: ScheduledJobIssueStatus
  reason: string | null
  jobName: string
  issueTypeIconUrl: string | null
  issueTypeName: string | null
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<ScheduledJobIssue>[] = [
  {
    accessorKey: "issueKey",
    header: "Issue Key",
    size: 100,
    cell: ({ row }) => {
      const issueKey: string = row.getValue("issueKey");
      const iconUrl: string | null = row.original.issueTypeIconUrl;
      const issueTypeName: string | null = row.original.issueTypeName;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2">
              {iconUrl && <Image src={iconUrl} alt="Issue Type Icon" width={20} height={20} />}
              <span>{issueKey}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{issueTypeName ? `${issueTypeName} - ` : ""}{issueKey}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "summary",
    header: "Summary",
    size: 400,
    cell: ({ row }) => {
      const summary: string = row.getValue("summary");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="truncate block">
              {summary}
            </TooltipTrigger>
            <TooltipContent>
              <p>{summary}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "jobName",
    header: "Job Name",
    size: 150,
    cell: ({ row }) => {
      const jobName: string = row.getValue("jobName");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="truncate block max-w-[150px]">
              {jobName}
            </TooltipTrigger>
            <TooltipContent>
              <p>{jobName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 100,
    cell: ({ row }) => {
      const status: ScheduledJobIssueStatus = row.getValue("status");
      const { text, icon } = getStatusIndicator(status);
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 border-dashed bg-transparent text-foreground">
                {icon && <span className="mr-1">{icon}</span>}
                {text}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{text}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => {
      return (
        <SortableHeader title="Scheduled At" sortKey="createdAt" />
      )
    },
    size: 160,
    cell: ({ row }) => {
      const DateCell = () => {
        const [mounted, setMounted] = useState(false);
        const value = row.getValue("createdAt");
        const date = new Date(value as string);
        
        useEffect(() => {
          setMounted(true);
        }, []);
        
        if (!mounted) {
          return <span>Loading...</span>;
        }
        
        const fullDateTime = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="block">
                {fullDateTime}
              </TooltipTrigger>
              <TooltipContent>
                <p>{fullDateTime}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      };
      
      return <DateCell />;
    },
  },
  {
    accessorKey: "updatedAt",
    header: () => {
      return (
        <SortableHeader title="Updated At" sortKey="updatedAt" />
      )
    },
    size: 160,
    cell: ({ row }) => {
      const DateCell = () => {
        const [mounted, setMounted] = useState(false);
        const value = row.getValue("updatedAt");
        const date = new Date(value as string);
        
        useEffect(() => {
          setMounted(true);
        }, []);
        
        if (!mounted) {
          return <span>Loading...</span>;
        }
        
        const fullDateTime = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="block">
                {fullDateTime}
              </TooltipTrigger>
              <TooltipContent>
                <p>{fullDateTime}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      };
      
      return <DateCell />;
    },
  },
  {
    id: "actions",
    header: "Actions",
    size: 80,
    cell: ({ row }) => {
      const status: ScheduledJobIssueStatus = row.getValue("status");
      if (status !== "completed" && status !== "failed" && status !== "stale") {
        return <span className="text-xs text-muted-foreground">N/A</span>;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer h-6 px-2"
                onClick={() => window.location.href = `/scheduler/review?issueId=${row.original.id}`}
              >
                Review
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{status === "completed" ? "Testcase generation completed. Review the testcase" : status === "failed" ? "Testcase generation failed. Review the details" : "Previous testcase generation marked as stale. Review the testcase"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
]

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
