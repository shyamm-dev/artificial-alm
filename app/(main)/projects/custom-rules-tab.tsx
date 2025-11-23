"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash2, Loader2, Lock, Shield, Database } from "lucide-react"
import { toast } from "sonner"

type CustomRule = {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  isActive: boolean
  tags: string[]
}

const SEVERITY_ICONS = {
  low: "○",
  medium: "◐",
  high: "●",
  critical: "⬤"
}

const SEVERITY_COLORS = {
  low: "text-blue-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  critical: "text-red-600"
}

const RULE_ICONS = [Lock, Shield, Database]

export function CustomRulesTab() {
  const [rules, setRules] = useState<CustomRule[]>([
    {
      id: "1",
      title: "All API endpoints must validate JWT tokens",
      description: "Every API endpoint must include JWT token validation before processing requests. Unauthorized requests should return 401 status code.",
      severity: "high",
      isActive: true,
      tags: ["Security", "Authentication", "API"]
    },
    {
      id: "2",
      title: "PII data must be encrypted at rest",
      description: "All personally identifiable information (PII) must be encrypted using AES-256 encryption when stored in the database.",
      severity: "critical",
      isActive: true,
      tags: ["Data Protection", "Encryption", "Privacy"]
    }
  ])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<CustomRule | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagSearchQuery, setTagSearchQuery] = useState("")

  const handleAddRule = () => {
    setEditingRule(null)
    setIsAddDialogOpen(true)
  }

  const handleEditRule = (rule: CustomRule) => {
    setEditingRule(rule)
    setIsAddDialogOpen(true)
  }

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id))
    toast.success("Rule deleted")
  }

  const handleToggleActive = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r))
  }

  // Get all unique tags
  const allTags = Array.from(new Set(rules.flatMap(r => r.tags)))

  // Filter tags based on search
  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Custom Compliance Rules</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Define project-specific rules that AI will enforce during test case generation
          </p>
        </div>
        <Button size="sm" onClick={handleAddRule}>
          <Plus className="h-4 w-4 mr-1" />
          Add Rule
        </Button>
      </div>

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
          <DialogContent className="sm:max-w-[400px]">
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
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      />
                      <label
                        htmlFor={`tag-${tag}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {tag}
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
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredRules.map((rule, index) => {
            const Icon = RULE_ICONS[index % RULE_ICONS.length]
            return (
              <Card key={rule.id} className={!rule.isActive ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight">{rule.title}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditRule(rule)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDeleteRule(rule.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{rule.description}</p>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {rule.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium flex items-center gap-1 ${SEVERITY_COLORS[rule.severity]}`}>
                            <span>{SEVERITY_ICONS[rule.severity]}</span>
                            {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                          </span>
                          <div className="flex items-center gap-1">
                            <Checkbox 
                              checked={rule.isActive} 
                              onCheckedChange={() => handleToggleActive(rule.id)}
                              className="h-3 w-3" 
                            />
                            <span className="text-xs text-muted-foreground">Active</span>
                          </div>
                        </div>
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
        onSave={(rule) => {
          if (editingRule) {
            setRules(rules.map(r => r.id === rule.id ? rule : r))
            toast.success("Rule updated")
          } else {
            setRules([...rules, { ...rule, id: Date.now().toString() }])
            toast.success("Rule added")
          }
          setIsAddDialogOpen(false)
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
  const [title, setTitle] = useState(rule?.title || "")
  const [description, setDescription] = useState(rule?.description || "")
  const [severity, setSeverity] = useState<CustomRule["severity"]>(rule?.severity || "medium")
  const [isActive, setIsActive] = useState(rule?.isActive ?? true)
  const [tags, setTags] = useState<string[]>(rule?.tags || [])
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [allAvailableTags] = useState([
    "Security", "Authentication", "Authorization", "API", "Database",
    "Data Protection", "Encryption", "Privacy", "Performance", "Scalability",
    "Error Handling", "Logging", "Monitoring", "Testing", "Validation",
    "Documentation", "Code Quality", "GDPR", "HIPAA", "SOC2", "PCI-DSS",
    "Audit Trail", "Business Logic", "Workflow", "User Experience"
  ])

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

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag))
    } else {
      setTags([...tags, tag])
    }
  }

  const filteredAvailableTags = allAvailableTags.filter(tag =>
    tag.toLowerCase().includes(tagInput.toLowerCase())
  )

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
    // Reset form
    setTitle("")
    setDescription("")
    setSeverity("medium")
    setIsActive(true)
    setTags([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
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
              Active (Inactive rules won't be enforced by AI)
            </label>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {tags.length > 0 ? (
                  tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
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
            <DialogContent className="sm:max-w-[400px]">
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
                  {filteredAvailableTags.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tags found
                    </p>
                  ) : (
                    filteredAvailableTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`add-tag-${tag}`}
                          checked={tags.includes(tag)}
                          onCheckedChange={() => handleToggleTag(tag)}
                        />
                        <label
                          htmlFor={`add-tag-${tag}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {tag}
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
