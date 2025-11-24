"use client"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { saveStandaloneProjectSettings } from "./actions/standalone-project-actions"
import { toast } from "sonner"
import { COMPLIANCE_FRAMEWORKS, ComplianceFramework } from "@/constants/shared-constants"
import { CustomRulesTab } from "./custom-rules-tab"

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: {
    id: string
    name: string
    description: string | null
    complianceStandards: string[]
  }
}

export function EditProjectDialog({ open, onOpenChange, project }: EditProjectDialogProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || "")
  const [originalName, setOriginalName] = useState(project.name)
  const [originalDescription, setOriginalDescription] = useState(project.description || "")
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>(project.complianceStandards as ComplianceFramework[])
  const [originalFrameworks, setOriginalFrameworks] = useState<ComplianceFramework[]>(project.complianceStandards as ComplianceFramework[])
  const [isSavingGeneral, setIsSavingGeneral] = useState(false)
  const [isSavingCompliance, setIsSavingCompliance] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    if (open) {
      setName(project.name)
      setDescription(project.description || "")
      setOriginalName(project.name)
      setOriginalDescription(project.description || "")
      setFrameworks(project.complianceStandards as ComplianceFramework[])
      setOriginalFrameworks(project.complianceStandards as ComplianceFramework[])
    }
  }, [open, project])

  const handleSaveGeneral = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Project name is required")
      return
    }
    if (/^\d+$/.test(trimmedName)) {
      toast.error("Project name cannot contain only numbers")
      return
    }

    setIsSavingGeneral(true)
    const result = await saveStandaloneProjectSettings(project.id, name, description || null, frameworks)
    if (result?.success) {
      toast.success("Project details updated")
      setOriginalName(name)
      setOriginalDescription(description)
    } else {
      toast.error(result?.message)
    }
    setIsSavingGeneral(false)
  }

  const handleSaveCompliance = async () => {
    setIsSavingCompliance(true)
    const result = await saveStandaloneProjectSettings(project.id, name, description || null, frameworks)
    if (result?.success) {
      toast.success("Compliance standards updated")
      setOriginalFrameworks(frameworks)
    } else {
      toast.error(result?.message)
    }
    setIsSavingCompliance(false)
  }

  const hasGeneralChanges = name !== originalName || description !== originalDescription
  const hasComplianceChanges = [...frameworks].sort().join(',') !== [...originalFrameworks].sort().join(',')

  const toggleFramework = (framework: ComplianceFramework) => {
    setFrameworks(prev =>
      prev.includes(framework)
        ? prev.filter(f => f !== framework)
        : [...prev, framework]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card sm:max-w-[800px] max-h-[85vh] flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details and compliance standards
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="rules">Custom Rules</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto mt-4">
          <TabsContent value="general" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                autoFocus={false}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>💡</span>
                <span>Quick Tips</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5 ml-6">
                <li>• Add compliance standards in the Compliance tab</li>
                <li>• Define custom rules for AI enforcement in Custom Rules tab</li>
                <li>• Export rules to share with your team</li>
                <li>• Active rules are automatically applied during test case generation</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="compliance" className="space-y-4 mt-0">
            <div className="space-y-3">
              <Label>Compliance Standards</Label>
              <div className="grid grid-cols-2 gap-2">
                {COMPLIANCE_FRAMEWORKS.map((framework) => (
                  <div key={framework} className="flex items-center space-x-2">
                    <Checkbox
                      id={`framework-${framework}`}
                      checked={frameworks.includes(framework)}
                      onCheckedChange={() => toggleFramework(framework)}
                    />
                    <label
                      htmlFor={`framework-${framework}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {framework}
                    </label>
                  </div>
                ))}
              </div>
              {frameworks.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {frameworks.length} {frameworks.length === 1 ? 'standard' : 'standards'}
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
            <CustomRulesTab projectId={project.id} projectType="standalone" open={open} />
          </TabsContent>
          </div>
        </Tabs>
        {activeTab !== "rules" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={activeTab === "compliance" ? handleSaveCompliance : handleSaveGeneral}
              disabled={activeTab === "compliance" ? (!hasComplianceChanges || isSavingCompliance) : (!hasGeneralChanges || isSavingGeneral)}
            >
              {(activeTab === "compliance" ? isSavingCompliance : isSavingGeneral) ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
