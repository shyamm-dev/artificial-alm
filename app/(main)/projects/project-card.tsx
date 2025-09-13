"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SettingsIcon } from "lucide-react"
import Image from "next/image"
import ProjectSheet from "./project-sheet"
import { JiraProject } from "@/data-access-layer/types"

interface ExtendedProject extends JiraProject {
  complianceStandards: string[];
}

interface ProjectCardProps {
  project: ExtendedProject;
  siteId: string;
  selectedProject: ExtendedProject | null;
  siteName: string;
  siteUrl: string;
  availableStandards: string[];
  onSettingsClick: (project: ExtendedProject) => void;
  onComplianceStandardToggle: (standard: string) => void;
}

export default function ProjectCard({
  project,
  siteId,
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
            <Avatar className="h-8 w-8">
              <AvatarImage src={project.avatarUrls?.['48x48']} alt={project.name} />
              <AvatarFallback className="text-sm">{project.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium text-foreground">Project Name</span>
                <span className="text-muted-foreground font-semibold"> : {project.name}</span>
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
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground text-xs">Description:</span>
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
