"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ScheduledJobIssueStatus } from "@/constants/shared-constants"
import Image from "next/image"
import { Clock, Zap, CheckCircle, XCircle, HelpCircle } from "lucide-react"

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
              <span className="truncate max-w-[100px]">{issueKey}</span>
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
    accessorKey: "status",
    header: "Status",
    size: 130,
    cell: ({ row }) => {
      const status: ScheduledJobIssueStatus = row.getValue("status");
      const { text, icon } = getStatusIndicator(status);
      return (
        <div className="flex items-center gap-2">
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
          {status === "completed" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer h-6 px-2"
                    onClick={() => console.log('Review clicked for:', row.original.id)}
                  >
                    Review
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Testcase generation completed. Review the testcase</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
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
      const value = row.getValue("createdAt");
      const date = new Date(value as string);
      const formattedDate = date.toLocaleDateString("en-US");
      const formattedTime = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
      const fullDateTime = `${formattedDate} ${formattedTime}`;
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
      const value = row.getValue("updatedAt");
      const date = new Date(value as string);
      const formattedDate = date.toLocaleDateString("en-US");
      const formattedTime = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
      const fullDateTime = `${formattedDate} ${formattedTime}`;
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
    default:
      return { text: "Unknown", icon: <HelpCircle className="h-3 w-3 text-gray-600" /> };
  }
};
