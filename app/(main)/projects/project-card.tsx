"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SettingsIcon, BarChart3Icon } from "lucide-react"
import ProjectSheet from "./project-sheet"
import Image from "next/image"
import { JiraProject } from "@/data-access-layer/atlassian-cloud-api/types"

interface ExtendedProject extends JiraProject {
  isSelected: boolean;
  complianceStandards: string[];
  lastSync: string;
}

interface ProjectCardProps {
  project: ExtendedProject;
  siteId: string;
  onProjectSelection: (siteId: string, projectId: string, isSelected: boolean) => void;
  onSettingsClick: (project: ExtendedProject) => void;
  selectedProject: ExtendedProject | null;
  siteName: string;
  siteUrl: string;
  availableStandards: string[];
  onComplianceStandardToggle: (standard: string) => void;
}

export default function ProjectCard({
  project,
  siteId,
  onProjectSelection,
  onSettingsClick,
  selectedProject,
  siteName,
  siteUrl,
  availableStandards,
  onComplianceStandardToggle
}: ProjectCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`project-${project.id}`}
              checked={project.isSelected}
              onCheckedChange={(checked) =>
                onProjectSelection(siteId, project.id, checked as boolean)
              }
            />
            <Avatar className="h-6 w-6">
              <AvatarImage src={project.avatarUrls?.['24x24']} alt={project.name} />
              <AvatarFallback className="text-xs">{project.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium text-foreground">Project Name</span>
                <span className="text-muted-foreground font-semibold"> : {project.name}</span>
              </div>
              <div className="space-y-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-muted-foreground text-xs cursor-help">
                        {project.description.length > 50
                          ? `${project.description.substring(0, 50)}...`
                          : project.description
                        }
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{project.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <ProjectSheet
            project={selectedProject || project}
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
        <div className="space-y-2">
          {project.issueTypes && project.issueTypes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground text-xs">Issue Types:</span>
              <div className="flex items-center gap-1">
                {project.issueTypes.map((issueType) => (
                  <TooltipProvider key={issueType.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Image
                          src={issueType.iconUrl}
                          alt={issueType.name}
                          className="h-3 w-3 cursor-help"
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground text-xs">Standards:</span>
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
            {project.insight && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                      <BarChart3Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{project.insight.totalIssueCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total Issues: {project.insight.totalIssueCount}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Last sync: {new Date(project.lastSync).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
