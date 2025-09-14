"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SettingsIcon } from "lucide-react"
import Image from "next/image"
import ProjectSheet from "./project-sheet"
import { jiraProject, jiraProjectIssueType, jiraProjectCompliance } from "@/db/schema/jira-project-schema"

type ProjectWithCompliance = typeof jiraProject.$inferSelect & {
  complianceStandards: string[]
  issueTypes?: (typeof jiraProjectIssueType.$inferSelect)[]
  compliance?: typeof jiraProjectCompliance.$inferSelect | null
}

export default function ProjectCard({
  project,
  onSettingsClick,
  siteName,
  siteUrl,
  availableStandards,
  onComplianceStandardToggle
}: {
  project: ProjectWithCompliance
  onSettingsClick: (project: ProjectWithCompliance) => void
  siteName: string
  siteUrl: string
  availableStandards: string[]
  onComplianceStandardToggle: (standard: string) => void
}) {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={project.avatar48 || undefined} alt={project.name} />
              <AvatarFallback className="text-sm">{project.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <h3 className="font-semibold text-foreground">{project.name}</h3>
            </div>
          </div>
          <ProjectSheet
            project={project}
            siteName={siteName}
            siteUrl={siteUrl}
            availableStandards={availableStandards}
            onComplianceStandardToggle={onComplianceStandardToggle}
          >
            <Button variant="ghost" size="sm" onClick={() => onSettingsClick(project)}>
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </ProjectSheet>
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
          {project.issueTypes && project.issueTypes.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-foreground text-xs min-w-fit">Issue Types:</span>
              <div className="flex items-center gap-1">
                {project.issueTypes.map((issueType) => (
                  <TooltipProvider key={issueType.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Image
                          src={issueType.iconUrl || ''}
                          alt={issueType.name}
                          width={12}
                          height={12}
                          className="h-3 w-3 cursor-help"
                          unoptimized
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{issueType.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
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
          {project.compliance?.lastUpdatedByName && (
            <div className="text-xs text-muted-foreground">
              Updated by {project.compliance.lastUpdatedByName} on {project.compliance.updatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
