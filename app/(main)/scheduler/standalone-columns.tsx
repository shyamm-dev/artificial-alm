"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StandaloneScheduledJobIssueStatus } from "@/constants/shared-constants"
import { Clock, Zap, CheckCircle, XCircle, HelpCircle } from "lucide-react"
import { useState, useEffect } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SortableHeader } from "./sortable-header"

export type StandaloneScheduledJobRequirement = {
  id: string
  requirementName: string
  status: StandaloneScheduledJobIssueStatus
  reason: string | null
  jobName: string
  projectName: string
  createdAt: string
  updatedAt: string
}

export const standaloneColumns: ColumnDef<StandaloneScheduledJobRequirement>[] = [
  {
    accessorKey: "requirementName",
    header: "Requirement Name",
    size: 250,
    cell: ({ row }) => {
      const requirementName: string = row.getValue("requirementName");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="truncate block">
              {requirementName}
            </TooltipTrigger>
            <TooltipContent>
              <p>{requirementName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "projectName",
    header: "Project",
    size: 150,
    cell: ({ row }) => {
      const projectName: string = row.getValue("projectName");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="truncate block max-w-[150px]">
              {projectName}
            </TooltipTrigger>
            <TooltipContent>
              <p>{projectName}</p>
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
    size: 130,
    cell: ({ row }) => {
      const status: StandaloneScheduledJobIssueStatus = row.getValue("status");
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
          {(status === "completed" || status === "failed") && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer h-6 px-2"
                    onClick={() => window.location.href = `/scheduler/review?requirementId=${row.original.id}`}
                  >
                    Review
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{status === "completed" ? "Testcase generation completed. Review the testcase" : "Testcase generation failed. Review the details"}</p>
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
]

const getStatusIndicator = (status: StandaloneScheduledJobIssueStatus) => {
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
