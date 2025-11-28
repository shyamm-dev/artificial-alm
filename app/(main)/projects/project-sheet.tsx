"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner";
import { saveProjectCompliance } from "./actions/sync-actions";
import { useState } from "react";
import { ComplianceFramework } from "@/constants/shared-constants";

export default function ProjectSheet({
  project,
  siteName,
  siteUrl,
  availableStandards,
  onComplianceStandardToggle,
  children
}: {
  project: {
    id: string
    name: string
    issueTypes?: { id: string; name: string; iconUrl: string | null; description?: string | null }[]
    complianceStandards: string[]
    compliance?: {
      lastUpdatedByName: string | null
      updatedAt: string
    } | null
  }
  siteName: string
  siteUrl: string
  availableStandards: string[]
  onComplianceStandardToggle: (standard: string) => void
  children: React.ReactNode
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const result = await saveProjectCompliance(project.id, project.complianceStandards as ComplianceFramework[]);
    if (result?.success) {
      toast.success(result.message);
    } else {
      toast.error(result?.message);
    }
    setIsSaving(false);
  };

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
          <span className="font-medium text-foreground">Org Name</span>
          <span className="text-muted-foreground">{': ' + siteName}</span>
          <span className="font-medium text-foreground">Project Name</span>
          <span className="text-muted-foreground">{': ' + project.name}</span>
          <span className="font-medium text-foreground">Org URL</span>
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
                        <Image
                          src={issueType.iconUrl || ''}
                          alt={issueType.name}
                          width={16}
                          height={16}
                          className="h-4 w-4"
                          unoptimized
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
        <div className="px-4 pb-20">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Active Standards</h4>
              <div className="flex flex-wrap gap-2">
                {project.complianceStandards.length > 0 ? (
                  project.complianceStandards.map((standard: string) => (
                    <Badge key={standard} variant="default">
                      {standard}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">NA</span>
                )}
              </div>
              {project.compliance?.lastUpdatedByName && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Last updated by {project.compliance.lastUpdatedByName} on {(() => {
                    const date = new Date(project.compliance.updatedAt);
                    date.setHours(date.getHours() + 5);
                    date.setMinutes(date.getMinutes() + 30);
                    return date.toLocaleDateString();
                  })()}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Available Standards</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableStandards.map((standard: string) => (
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
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <SheetClose asChild>
            <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
