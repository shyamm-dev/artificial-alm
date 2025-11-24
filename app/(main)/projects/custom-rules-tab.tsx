"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Trash2, Loader2, Lock, Shield, Database, Download } from "lucide-react"
import { toast } from "sonner"
import { getProjectCustomRulesAction, createProjectCustomRuleAction, updateProjectCustomRuleAction, deleteProjectCustomRuleAction, toggleProjectCustomRuleStatusAction, getAllCustomRuleTagsAction } from "./actions/custom-rules-actions"
import { tryCatch } from "@/lib/try-catch"

type CustomRule = {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  isActive: boolean
  tags: string[]
}

interface CustomRulesTabProps {
  projectId: string
  projectType: "standalone" | "jira"
  open?: boolean
}

const SEVERITY_COLORS = {
  low: "text-blue-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  critical: "text-red-600"
}

const RULE_ICONS = [Lock, Shield, Database]

export function CustomRulesTab({ projectId, projectType, open = true }: CustomRulesTabProps) {
  const [rules, setRules] = useState<CustomRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<CustomRule | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagSearchQuery, setTagSearchQuery] = useState("")
  const [allTags, setAllTags] = useState<Array<{ id: string; name: string; description: string }>>([])

  const loadRules = useCallback(async () => {
    setIsLoading(true)
    const [rulesResult, tagsResult] = await Promise.all([
      tryCatch(getProjectCustomRulesAction(projectId, projectType)),
      getAllCustomRuleTagsAction()
    ])
    
    if (rulesResult.error) {
      toast.error("Failed to load rules")
    } else if (!rulesResult.data?.success) {
      toast.error(rulesResult.data?.message || "Access denied")
    } else {
      setRules((rulesResult.data.data || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        severity: r.severity,
        isActive: r.isActive,
        tags: r.tags || []
      })))
    }
    
    if (tagsResult.success && tagsResult.data) {
      setAllTags(tagsResult.data)
    }
    
    setIsLoading(false)
  }, [projectId, projectType])

  useEffect(() => {
    if (open) {
      loadRules()
    }
  }, [open, loadRules])

  const handleAddRule = () => {
    setEditingRule(null)
    setIsAddDialogOpen(true)
  }

  const handleEditRule = (rule: CustomRule) => {
    setEditingRule(rule)
    setIsAddDialogOpen(true)
  }

  const handleDeleteRule = async (id: string) => {
    const result = await deleteProjectCustomRuleAction(id)
    if (result.success) {
      setRules(rules.filter(r => r.id !== id))
      toast.success("Rule deleted")
    } else {
      toast.error(result.message)
    }
  }

  const handleToggleActive = async (id: string) => {
    const rule = rules.find(r => r.id === id)
    if (!rule) return
    const result = await toggleProjectCustomRuleStatusAction(id, !rule.isActive)
    if (result.success) {
      setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r))
    } else {
      toast.error(result.message)
    }
  }

  // Get tag name by ID
  const getTagName = (tagId: string) => {
    return allTags.find(t => t.id === tagId)?.name || tagId
  }

  // Get all unique tag IDs from rules
  const usedTagIds = Array.from(new Set(rules.flatMap(r => r.tags)))
  const usedTags = usedTagIds.map(id => allTags.find(t => t.id === id)).filter(Boolean) as Array<{ id: string; name: string; description: string }>

  // Filter tags based on search
  const filteredTags = usedTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  )

  // Filter rules based on search and selected tags
  const filteredRules = rules.filter(rule => {
    const matchesSearch =
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => rule.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  const handleExport = () => {
    const exportData = rules.map(rule => ({
      title: rule.title,
      description: rule.description,
      severity: rule.severity,
      tags: rule.tags,
      isActive: rule.isActive
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `custom-rules-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${rules.length} rule(s)`)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="px-5 py-3">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Custom Compliance Rules</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Define project-specific rules that AI will enforce during test case generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rules.length > 0 && (
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}
          <Button size="sm" onClick={handleAddRule}>
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                <Badge variant="secondary" className="mr-1.5">{selectedTags.length}</Badge>
                Filter by Tags
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Filter by Tags</DialogTitle>
              <DialogDescription>
                Select tags to filter rules
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Search tags..."
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
              />
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tags found
                  </p>
                ) : (
                  filteredTags.map(tag => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {selectedTags.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="w-full"
                >
                  Clear All
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
        </div>
        <p className="text-xs text-muted-foreground">
          {(searchQuery || selectedTags.length > 0) ? (
            <>Showing {filteredRules.length} of {rules.length} {rules.length === 1 ? 'rule' : 'rules'}</>
          ) : (
            <>{rules.length} {rules.length === 1 ? 'rule' : 'rules'} total</>
          )}
        </p>
      </div>

      {filteredRules.length === 0 && rules.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <p className="text-sm text-muted-foreground mb-3">No custom rules yet</p>
          <Button size="sm" variant="outline" onClick={handleAddRule}>
            <Plus className="h-4 w-4 mr-1" />
            Add your first rule
          </Button>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-sm text-muted-foreground">No rules match your search or filter</p>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setSearchQuery("")
              setSelectedTags([])
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
          {filteredRules.map((rule, index) => {
            const Icon = RULE_ICONS[index % RULE_ICONS.length]
            return (
              <Card key={rule.id} className={`transition-all hover:shadow-md ${!rule.isActive ? "opacity-60" : ""}`}>
                <CardContent className="px-5 py-3">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${rule.severity === 'critical' ? 'bg-red-100 dark:bg-red-950' : rule.severity === 'high' ? 'bg-orange-100 dark:bg-orange-950' : rule.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-950' : 'bg-blue-100 dark:bg-blue-950'}`}>
                          <Icon className="h-4 w-4 shrink-0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base leading-tight mb-1">{rule.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditRule(rule)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => handleDeleteRule(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {rule.tags.map(tagId => (
                        <Badge key={tagId} variant="secondary" className="text-xs px-2 py-0.5">
                          {getTagName(tagId)}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={rule.isActive}
                          onCheckedChange={() => handleToggleActive(rule.id)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-muted-foreground">Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Severity:</span>
                        <Badge variant="outline" className={`text-xs font-semibold ${SEVERITY_COLORS[rule.severity]}`}>
                          {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AddEditRuleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        rule={editingRule}
        onSave={async (rule) => {
          if (editingRule) {
            const result = await updateProjectCustomRuleAction(rule.id, {
              title: rule.title,
              description: rule.description,
              severity: rule.severity,
              isActive: rule.isActive,
              tags: rule.tags
            })
            if (result.success) {
              setRules(rules.map(r => r.id === rule.id ? rule : r))
              toast.success("Rule updated")
              setIsAddDialogOpen(false)
            } else {
              toast.error(result.message)
            }
          } else {
            const result = await createProjectCustomRuleAction({
              projectId,
              projectType,
              title: rule.title,
              description: rule.description,
              severity: rule.severity,
              isActive: rule.isActive,
              tags: rule.tags
            })
            if (result.success && result.data) {
              setRules([...rules, { ...rule, id: result.data.id }])
              toast.success("Rule added")
              setIsAddDialogOpen(false)
            } else {
              toast.error(result.message)
            }
          }
        }}
      />
    </div>
  )
}

function AddEditRuleDialog({
  open,
  onOpenChange,
  rule,
  onSave
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: CustomRule | null
  onSave: (rule: CustomRule) => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState<CustomRule["severity"]>("medium")
  const [isActive, setIsActive] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [allAvailableTags, setAllAvailableTags] = useState<Array<{ id: string; name: string; description: string }>>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)

  useEffect(() => {
    if (open && rule) {
      setTitle(rule.title)
      setDescription(rule.description)
      setSeverity(rule.severity)
      setIsActive(rule.isActive)
      setTags(rule.tags)
    } else if (open && !rule) {
      setTitle("")
      setDescription("")
      setSeverity("medium")
      setIsActive(true)
      setTags([])
    }
  }, [open, rule])

  useEffect(() => {
    const loadTags = async () => {
      setIsLoadingTags(true)
      const result = await getAllCustomRuleTagsAction()
      if (result.success && result.data) {
        setAllAvailableTags(result.data)
      }
      setIsLoadingTags(false)
    }
    if (open) {
      loadTags()
    }
  }, [open])

  const handleGenerateTags = async () => {
    if (!description.trim()) {
      toast.error("Please enter a description first")
      return
    }
    setIsGeneratingTags(true)
    // Simulate AI tag generation
    await new Promise(resolve => setTimeout(resolve, 1500))
    const mockTags = ["Security", "Authentication", "API", "Authorization"]
    setTags(mockTags)
    setIsGeneratingTags(false)
    toast.success("Tags generated successfully")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleToggleTag = (tagId: string) => {
    if (tags.includes(tagId)) {
      setTags(tags.filter(t => t !== tagId))
    } else {
      setTags([...tags, tagId])
    }
  }

  const filteredAvailableTags = allAvailableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagInput.toLowerCase())
  )

  const getTagName = (tagId: string) => {
    return allAvailableTags.find(t => t.id === tagId)?.name || tagId
  }

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required")
      return
    }
    onSave({
      id: rule?.id || "",
      title: title.trim(),
      description: description.trim(),
      severity,
      isActive,
      tags
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{rule ? "Edit" : "Add"} Custom Rule</DialogTitle>
          <DialogDescription>
            Define a custom compliance rule for this project
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rule-title">Rule Title *</Label>
            <Input
              id="rule-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., All API endpoints must validate JWT tokens"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-description">Rule Description *</Label>
            <Textarea
              id="rule-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the rule in detail..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Severity *</Label>
            <div className="flex gap-4">
              {(["low", "medium", "high", "critical"] as const).map((sev) => (
                <label key={sev} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="severity"
                    value={sev}
                    checked={severity === sev}
                    onChange={(e) => setSeverity(e.target.value as CustomRule["severity"])}
                    className="cursor-pointer"
                  />
                  <span className="text-sm capitalize">{sev}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rule-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
            />
            <label htmlFor="rule-active" className="text-sm cursor-pointer">
              Active (Inactive rules won&apos;t be enforced by AI)
            </label>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {tags.length > 0 ? (
                  tags.map(tagId => (
                    <Badge key={tagId} variant="secondary" className="text-xs px-2 py-1">
                      {getTagName(tagId)}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tagId)}
                        className="ml-1.5 hover:text-destructive text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-1">
                    Add tags manually or generate with AI
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTagDialogOpen(true)}
                  className="h-8 flex-1"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Tags
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateTags}
                  disabled={isGeneratingTags || !description.trim()}
                  className="h-8 px-3 shrink-0"
                >
                  {isGeneratingTags ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Tags</DialogTitle>
                <DialogDescription>
                  Select tags for this rule
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Search tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {isLoadingTags ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading tags...</p>
                  ) : filteredAvailableTags.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tags found
                    </p>
                  ) : (
                    filteredAvailableTags.map(tag => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`add-tag-${tag.id}`}
                          checked={tags.includes(tag.id)}
                          onCheckedChange={() => handleToggleTag(tag.id)}
                        />
                        <label
                          htmlFor={`add-tag-${tag.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          <div>
                            <div className="font-medium">{tag.name}</div>
                            {tag.description && (
                              <div className="text-xs text-muted-foreground">{tag.description}</div>
                            )}
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => {
                    setIsTagDialogOpen(false)
                    setTagInput("")
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {rule ? "Update" : "Add"} Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
