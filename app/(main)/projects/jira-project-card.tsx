"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EditJiraProjectDialog } from "./edit-jira-project-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Pencil, RefreshCw, CheckCircle, XCircle, BarChart3, FileText, Info, ArrowUpRight, Zap } from "lucide-react"
import { jiraProject, jiraProjectCompliance } from "@/db/schema/jira-project-schema"
import { refreshJiraProjectStats } from "./actions/refresh-jira-project-stats"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type JiraProjectWithCompliance = typeof jiraProject.$inferSelect & {
  complianceStandards: string[]
  compliance?: typeof jiraProjectCompliance.$inferSelect | null
}

export default function JiraProjectCard({
  project,
  stats,
}: {
  project: JiraProjectWithCompliance
  stats: {
    success: number
    failed: number
    inProgress: number
    pending: number
    total: number
  }
}) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentStats, setCurrentStats] = useState(stats);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState("just now");

  useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
      if (seconds < 5) setTimeAgo("just now");
      else if (seconds < 10) setTimeAgo("5s ago");
      else if (seconds < 30) setTimeAgo("10s ago");
      else if (seconds < 60) setTimeAgo("30s ago");
      else if (seconds < 180) setTimeAgo("1m ago");
      else if (seconds < 300) setTimeAgo("3m ago");
      else if (seconds < 600) setTimeAgo("5m ago");
      else if (seconds < 1800) setTimeAgo(`${Math.floor(seconds / 600) * 10}m ago`);
      else if (seconds < 3600) setTimeAgo("30m ago");
      else if (seconds < 86400) setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
      else setTimeAgo(`${Math.floor(seconds / 86400)}d ago`);
    };
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await refreshJiraProjectStats(project.id);
    if (result.success && result.stats) {
      setCurrentStats(result.stats);
      setLastUpdated(new Date());
      toast.success("Stats refreshed successfully");
    } else {
      toast.error(result.message || "Failed to refresh stats");
    }
    setIsRefreshing(false);
  };

  const handleEditClose = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      router.refresh();
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={project.avatar48 || undefined} alt={project.name} />
              <AvatarFallback className="text-sm">{project.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-foreground text-sm truncate">{project.name}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={() => router.push(`/scheduler?projectId=${project.id}`)}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs hidden xl:inline">Test Cases</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1 px-2" onClick={() => setIsEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5" />
              <span className="text-xs hidden xl:inline">Edit</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* Description */}
        <div className="text-sm line-clamp-2 h-[2.4rem]">
          <span className="font-medium text-foreground">Description :</span>{' '}
          <span className="text-muted-foreground">
            {project.description || 'No description'}
          </span>
        </div>

        {/* Test Cases Overview */}
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="font-semibold text-sm">Test Cases Overview</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Shows the number of issues and their status</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 group hover:w-auto hover:border hover:border-input transition-all"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden group-hover:inline ml-1 text-xs whitespace-nowrap">{timeAgo}</span>
            </Button>
          </div>
          {isRefreshing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-1 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : currentStats.total > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
                <span>STATUS BREAKDOWN</span>
                <span>COUNT</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Success</span>
                </div>
                <span className="font-semibold">{currentStats.success}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Failed</span>
                </div>
                <span className="font-semibold">{currentStats.failed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span>In Progress</span>
                </div>
                <span className="font-semibold">{currentStats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <span>Pending</span>
                </div>
                <span className="font-semibold">{currentStats.pending}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span>Total Issues</span>
                  </div>
                  <span>{currentStats.total}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-sm text-muted-foreground">Generate your first test case to view stats</p>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => router.push('/scheduler/new')}>
                Take me there
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Compliance Standards */}
        <div>
          <span className="font-medium text-foreground text-sm">Compliance Standards :</span>{' '}
          {project.complianceStandards.length > 0 ? (
            project.complianceStandards.map((standard) => (
              <Badge key={standard} variant="secondary" className="text-xs inline-flex">
                {standard}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No standards configured</span>
          )}
        </div>


      </CardContent>
      <EditJiraProjectDialog
        open={isEditOpen}
        onOpenChange={handleEditClose}
        project={project}
      />
    </Card>
  )
}
