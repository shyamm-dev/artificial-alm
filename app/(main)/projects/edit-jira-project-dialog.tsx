"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { COMPLIANCE_FRAMEWORKS } from "@/constants/shared-constants"
import { jiraProject, jiraProjectCompliance } from "@/db/schema/jira-project-schema"
import { updateJiraProjectCompliance } from "./actions/update-jira-project-compliance"
import { toast } from "sonner"

type JiraProjectWithCompliance = typeof jiraProject.$inferSelect & {
  complianceStandards: string[]
  compliance?: typeof jiraProjectCompliance.$inferSelect | null
}

interface EditJiraProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: JiraProjectWithCompliance
}

export function EditJiraProjectDialog({ open, onOpenChange, project }: EditJiraProjectDialogProps) {
  const [selectedStandards, setSelectedStandards] = useState<string[]>(project.complianceStandards)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggleStandard = (standard: string) => {
    setSelectedStandards(prev =>
      prev.includes(standard)
        ? prev.filter(s => s !== standard)
        : [...prev, standard]
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const result = await updateJiraProjectCompliance(project.id, selectedStandards)
    if (result.success) {
      toast.success("Project updated successfully")
      onOpenChange(false)
    } else {
      toast.error(result.message || "Failed to update project")
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update compliance standards for {project.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Project Name <span className="text-muted-foreground">(readonly)</span></Label>
            <Input value={project.name} disabled />
          </div>
          <div className="space-y-2">
            <Label>Description <span className="text-muted-foreground">(readonly)</span></Label>
            <Textarea value={project.description || "No description"} disabled className="resize-none" rows={3} />
          </div>
          <div>
            <Label>Compliance Standards</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {COMPLIANCE_FRAMEWORKS.map((standard) => (
                <div key={standard} className="flex items-center space-x-2">
                  <Checkbox
                    id={`jira-${standard}`}
                    checked={selectedStandards.includes(standard)}
                    onCheckedChange={() => handleToggleStandard(standard)}
                  />
                  <label
                    htmlFor={`jira-${standard}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {standard}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
