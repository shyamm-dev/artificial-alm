"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SettingsIcon, FolderIcon } from "lucide-react"
import { StandaloneProjectSheet } from "./standalone-project-sheet"
import { standaloneProject, standaloneProjectCompliance } from "@/db/schema"

type StandaloneProjectWithCompliance = typeof standaloneProject.$inferSelect & {
  complianceStandards: string[]
  compliance?: typeof standaloneProjectCompliance.$inferSelect | null
}

export default function StandaloneProjectCard({
  project,
  onSettingsClick,
  availableStandards,
  onComplianceStandardToggle,
  onResetCompliance
}: {
  project: StandaloneProjectWithCompliance
  onSettingsClick: (project: StandaloneProjectWithCompliance) => void
  availableStandards: string[]
  onComplianceStandardToggle: (standard: string) => void
  onResetCompliance: (projectId: string) => void
}) {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm">
                <FolderIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <h3 className="font-semibold text-foreground">{project.name}</h3>
            </div>
          </div>
          <StandaloneProjectSheet
            project={project}
            availableStandards={availableStandards}
            onComplianceStandardToggle={onComplianceStandardToggle}
            onResetCompliance={onResetCompliance}
          >
            <Button variant="ghost" size="sm" onClick={() => onSettingsClick(project)}>
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </StandaloneProjectSheet>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground text-xs min-w-fit">Description:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground text-xs cursor-help">
                    {(project.description || '').length > 50
                      ? `${(project.description || '').substring(0, 50)}...`
                      : (project.description || 'No description')
                    }
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{project.description || 'No description'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <span className="font-medium text-foreground text-xs min-w-fit">Standards:</span>
              {project.complianceStandards.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {project.complianceStandards.slice(0, 2).map((standard) => (
                    <Badge key={standard} variant="secondary" className="text-xs">
                      {standard}
                    </Badge>
                  ))}
                  {project.complianceStandards.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.complianceStandards.length - 2} more
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">NA</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
