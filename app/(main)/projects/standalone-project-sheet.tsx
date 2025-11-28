"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner";
import { saveStandaloneProjectSettings, deleteStandaloneProject } from "./actions/standalone-project-actions";
import { useState } from "react";
import { ComplianceFramework } from "@/constants/shared-constants";

export function StandaloneProjectSheet({
  project,
  availableStandards,
  onComplianceStandardToggle,
  onResetCompliance,
  children
}: {
  project: {
    id: string
    name: string
    description: string | null
    complianceStandards: string[]
    compliance?: {
      updatedAt: string
    } | null
  }
  availableStandards: string[]
  onComplianceStandardToggle: (standard: string) => void
  onResetCompliance: (projectId: string) => void
  children: React.ReactNode
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveChanges = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Project name is required");
      return;
    }
    if (/^\d+$/.test(trimmedName)) {
      toast.error("Project name cannot contain only numbers");
      return;
    }
    setIsSaving(true);
    const result = await saveStandaloneProjectSettings(
      project.id,
      name,
      description || null,
      project.complianceStandards as ComplianceFramework[]
    );
    if (result?.success) {
      toast.success(result.message);
    } else {
      toast.error(result?.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteStandaloneProject(project.id);
    if (result?.success) {
      toast.success(result.message);
    } else {
      toast.error(result?.message);
    }
    setIsDeleting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSaving) {
      // Reset compliance state when closing without saving
      onResetCompliance(project.id);
      // Reset form fields
      setName(project.name);
      setDescription(project.description || "");
    }
    setIsOpen(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Compliance Settings</SheetTitle>
          <SheetDescription>Configure compliance standards for this project</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </div>
        </div>
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
              {project.compliance?.updatedAt && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Last updated on {(() => {
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
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting} className="flex-1">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this project? All test cases generated under it will be deleted. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSaveChanges} disabled={isSaving} className="flex-1">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
