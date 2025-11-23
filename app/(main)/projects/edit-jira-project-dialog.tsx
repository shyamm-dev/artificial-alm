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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { COMPLIANCE_FRAMEWORKS } from "@/constants/shared-constants"
import { jiraProject, jiraProjectCompliance } from "@/db/schema/jira-project-schema"
import { updateJiraProjectCompliance } from "./actions/update-jira-project-compliance"
import { toast } from "sonner"
import { CustomRulesTab } from "./custom-rules-tab"

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
  const [activeTab, setActiveTab] = useState("general")
  
  const hasChanges = JSON.stringify(selectedStandards.sort()) !== JSON.stringify([...project.complianceStandards].sort())

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
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col bg-card">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update compliance standards for {project.name}
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="rules">Custom Rules</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto mt-4">
          <TabsContent value="general" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label>Project Name <span className="text-muted-foreground">(readonly)</span></Label>
              <Input value={project.name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Description <span className="text-muted-foreground">(readonly)</span></Label>
              <Textarea value={project.description || "No description"} disabled className="resize-none" rows={3} />
            </div>
            <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>💡</span>
                <span>Quick Tips</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5 ml-6">
                <li>• Project details are synced from Jira</li>
                <li>• Add compliance standards in the Compliance tab</li>
                <li>• Define custom rules for AI enforcement in Custom Rules tab</li>
                <li>• Active rules are automatically applied during test case generation</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="compliance" className="space-y-4 mt-0">
            <div className="space-y-3">
              <Label>Compliance Standards</Label>
              <div className="grid grid-cols-2 gap-3">
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
              {selectedStandards.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {selectedStandards.length} {selectedStandards.length === 1 ? 'standard' : 'standards'}
                </p>
              )}
            </div>
            <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>ℹ️</span>
                <span>About Compliance Standards</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1.5">
                <p><strong>FDA:</strong> Medical device regulations and quality system requirements</p>
                <p><strong>IEC 62304:</strong> Medical device software lifecycle processes</p>
                <p><strong>ISO 9001:</strong> Quality management system standards</p>
                <p><strong>ISO 13485:</strong> Medical devices quality management systems</p>
                <p><strong>ISO 27001:</strong> Information security management standards</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="rules" className="mt-0">
            <CustomRulesTab projectId={project.id} projectType="jira" open={open} />
          </TabsContent>
          </div>
        </Tabs>
        {activeTab === "compliance" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
