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
import { Plus } from "lucide-react"
import { useState } from "react"
import { createStandaloneProject } from "./actions/standalone-project-actions"
import { toast } from "sonner"
import { COMPLIANCE_FRAMEWORKS, ComplianceFramework } from "@/constants/shared-constants"

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Project name is required")
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
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a standalone project to organize your test cases
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
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
        </div>
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
