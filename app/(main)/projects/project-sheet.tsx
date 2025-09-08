"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { JiraProject } from "@/lib/data-access-layer/atlassian-api/types"

interface ExtendedProject extends JiraProject {
  isSelected: boolean;
  complianceStandards: string[];
  lastSync: string;
}

interface ProjectSheetProps {
  project: ExtendedProject;
  siteName: string;
  siteUrl: string;
  availableStandards: string[];
  onComplianceStandardToggle: (standard: string) => void;
  children: React.ReactNode;
}

export default function ProjectSheet({
  project,
  siteName,
  siteUrl,
  availableStandards,
  onComplianceStandardToggle,
  children
}: ProjectSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Compliance Settings</SheetTitle>
          <SheetDescription>Configure compliance standards for this project</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-2 space-y-1 text-sm grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
          <span className="font-medium text-foreground">Site Name</span>
          <span className="text-muted-foreground">{': ' + siteName}</span>
          <span className="font-medium text-foreground">Project Name</span>
          <span className="text-muted-foreground">{': ' + project.name}</span>
          <span className="font-medium text-foreground">Project URL</span>
          <span className="text-muted-foreground">{': ' + siteUrl}</span>
        </div>
        {project.issueTypes && project.issueTypes.length > 0 && (
          <div className="px-4 pb-4">
            <h4 className="text-sm font-medium mb-3">Issue Types</h4>
            <div className="flex flex-wrap gap-2">
              {project.issueTypes.map((issueType) => (
                <TooltipProvider key={issueType.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2 border rounded-md cursor-help">
                        <img
                          src={issueType.iconUrl}
                          alt={issueType.name}
                          className="h-4 w-4"
                        />
                        <span className="text-xs">{issueType.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{issueType.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
        <div className="px-4 pb-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Active Standards</h4>
              <div className="flex flex-wrap gap-2">
                {project.complianceStandards.map((standard: string) => (
                  <Badge key={standard} variant="default">
                    {standard}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Available Standards</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableStandards.map((standard) => (
                  <div key={standard} className="flex items-center space-x-2">
                    <Checkbox
                      id={`standard-${standard}`}
                      checked={project.complianceStandards.includes(standard)}
                      onCheckedChange={() => onComplianceStandardToggle(standard)}
                    />
                    <label
                      htmlFor={`standard-${standard}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {standard}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Save Changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
