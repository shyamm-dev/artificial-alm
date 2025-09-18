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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-transparent text-foreground">
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
    header: "Scheduled At",
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
    header: "Updated At",
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
      return { text: "Pending", icon: <Clock className="h-3 w-3" /> };
    case "in_progress":
      return { text: "Running", icon: <Zap className="h-3 w-3" /> };
    case "completed":
      return { text: "Success", icon: <CheckCircle className="h-3 w-3" /> };
    case "failed":
      return { text: "Failed", icon: <XCircle className="h-3 w-3" /> };
    default:
      return { text: "Unknown", icon: <HelpCircle className="h-3 w-3" /> };
  }
};
