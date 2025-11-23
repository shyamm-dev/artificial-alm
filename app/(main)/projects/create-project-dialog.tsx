"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { useState } from "react"
import { createStandaloneProject } from "./actions/standalone-project-actions"
import { toast } from "sonner"
import { COMPLIANCE_FRAMEWORKS, ComplianceFramework } from "@/constants/shared-constants"

export function CreateProjectDialog({ triggerButton }: { triggerButton?: React.ReactNode } = {}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Project name is required")
      return
    }
    if (/^\d+$/.test(trimmedName)) {
      toast.error("Project name cannot contain only numbers")
      return
    }

    setIsCreating(true)
    const result = await createStandaloneProject(name, description || null, frameworks)
    if (result?.success) {
      toast.success(result.message)
      setOpen(false)
      setName("")
      setDescription("")
      setFrameworks([])
    } else {
      toast.error(result?.message)
    }
    setIsCreating(false)
  }

  const toggleFramework = (framework: ComplianceFramework) => {
    setFrameworks(prev =>
      prev.includes(framework)
        ? prev.filter(f => f !== framework)
        : [...prev, framework]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card sm:max-w-[800px] max-h-[85vh] flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a standalone project to organize your test cases
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
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
                <li>• Define custom rules after creating the project</li>
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
          </div>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
