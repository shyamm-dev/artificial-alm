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
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>(project.complianceStandards as ComplianceFramework[])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(project.name)
      setDescription(project.description || "")
      setFrameworks(project.complianceStandards as ComplianceFramework[])
    }
  }, [open, project])

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Project name is required")
      return
    }
    if (/^\d+$/.test(trimmedName)) {
      toast.error("Project name cannot contain only numbers")
      return
    }

    setIsSaving(true)
    const result = await saveStandaloneProjectSettings(project.id, name, description || null, frameworks)
    if (result?.success) {
      toast.success(result.message)
      onOpenChange(false)
    } else {
      toast.error(result?.message)
    }
    setIsSaving(false)
  }

  const toggleFramework = (framework: ComplianceFramework) => {
    setFrameworks(prev =>
      prev.includes(framework)
        ? prev.filter(f => f !== framework)
        : [...prev, framework]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card sm:max-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details and compliance standards
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="rules">Custom Rules</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4 py-4">
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
          </TabsContent>
          <TabsContent value="compliance" className="space-y-4 py-4">
            <div className="space-y-2">
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
            </div>
          </TabsContent>
          <TabsContent value="rules" className="py-4">
            <CustomRulesTab />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
