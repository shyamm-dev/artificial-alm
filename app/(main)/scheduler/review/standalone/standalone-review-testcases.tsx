"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Save, Download, RotateCcw, Plus, Trash2, Bot, User, ChevronDown, Loader2, ArrowLeft, XCircle } from "lucide-react"
import { exportTestCasesToMarkdown, exportTestCasesToPlainText } from "@/lib/export-utils"
import { saveStandaloneTestCasesDraft } from "./actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TestCaseGeneratedBy } from "@/constants/shared-constants"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface StandaloneTestCase {
  id: string
  requirementId: string
  summary: string
  description: string
  generatedBy: TestCaseGeneratedBy
  modifiedByUserId: string | null
  createdAt: string
  updatedAt: string
}

interface StandaloneRequirement {
  id: string
  requirementName: string
  status: string
  reason: string | null
  projectName: string
  projectId: string
  jobName: string
}

interface StandaloneReviewTestCasesProps {
  requirement: StandaloneRequirement
  testCases: StandaloneTestCase[]
  tab: string
}

export function StandaloneReviewTestCases({ requirement, testCases: initialTestCases }: StandaloneReviewTestCasesProps) {
  const router = useRouter()
  const [testCases, setTestCases] = useState(initialTestCases)
  const [baselineTestCases, setBaselineTestCases] = useState(initialTestCases)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [backDialogOpen, setBackDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, { summary?: string; description?: string }>>({})

  if (!requirement) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Requirement not found</p>
      </div>
    )
  }

  const updateTestCase = (id: string, field: keyof StandaloneTestCase, value: string) => {
    setTestCases(prev => prev.map(tc =>
      tc.id === id ? { ...tc, [field]: value, updatedAt: new Date().toISOString() } : tc
    ))
    
    const trimmedValue = value.trim()
    if (trimmedValue && validationErrors[id]?.[field as 'summary' | 'description']) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        if (newErrors[id]) {
          delete newErrors[id][field as 'summary' | 'description']
          if (!newErrors[id].summary && !newErrors[id].description) {
            delete newErrors[id]
          }
        }
        return newErrors
      })
    }
  }

  const resetTestCase = (id: string) => {
    const original = baselineTestCases.find(tc => tc.id === id)
    if (original) {
      setTestCases(prev => prev.map(tc =>
        tc.id === id ? original : tc
      ))
    }
  }

  const addTestCase = () => {
    const newTestCase: StandaloneTestCase = {
      id: `new-${Date.now()}`,
      requirementId: requirement?.id || '',
      summary: '',
      description: '',
      generatedBy: 'manual' as TestCaseGeneratedBy,
      modifiedByUserId: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setTestCases(prev => [newTestCase, ...prev])
  }

  const removeTestCase = (id: string) => {
    if (testCases.length <= 1) {
      toast.error("Cannot delete the last test case. At least one test case is required.")
      return
    }
    setTestCases(prev => prev.filter(tc => tc.id !== id))
  }

  const resetAll = () => {
    setTestCases(baselineTestCases)
    setResetDialogOpen(false)
  }

  const hasChanges = JSON.stringify(testCases) !== JSON.stringify(baselineTestCases)
  
  const validateTestCases = () => {
    const errors: Record<string, { summary?: string; description?: string }> = {}
    
    testCases.forEach(testCase => {
      const testCaseErrors: { summary?: string; description?: string } = {}
      
      const trimmedSummary = testCase.summary.trim()
      if (!trimmedSummary) {
        testCaseErrors.summary = "Summary is required"
      } else if (/^\d+$/.test(trimmedSummary)) {
        testCaseErrors.summary = "Summary cannot contain only numbers"
      }
      
      if (!testCase.description.trim()) {
        testCaseErrors.description = "Description is required"
      }
      
      if (testCaseErrors.summary || testCaseErrors.description) {
        errors[testCase.id] = testCaseErrors
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveDraft = async () => {
    if (!validateTestCases()) {
      toast.error("Please fix validation errors before saving.")
      return
    }
    
    setIsSaving(true)
    try {
      await saveStandaloneTestCasesDraft(testCases)
      setBaselineTestCases(testCases)
      setValidationErrors({})
      toast.success("Changes saved successfully!")
    } catch (error) {
      console.error("Failed to save changes:", error)
      toast.error("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportMarkdown = () => {
    exportTestCasesToMarkdown(testCases, initialTestCases, { 
      issueKey: requirement.requirementName, 
      summary: requirement.requirementName,
      jobName: requirement.jobName,
      projectName: requirement.projectName
    })
  }

  const handleExportPlainText = () => {
    exportTestCasesToPlainText(testCases, initialTestCases, { 
      issueKey: requirement.requirementName, 
      summary: requirement.requirementName,
      jobName: requirement.jobName,
      projectName: requirement.projectName
    })
  }

  const handleBack = () => {
    if (hasChanges) {
      setBackDialogOpen(true)
    } else {
      router.push('/scheduler')
    }
  }

  const confirmBack = () => {
    setBackDialogOpen(false)
    router.push('/scheduler')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Review Test Cases
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={requirement?.status === "failed"}>
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportMarkdown}>
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPlainText}>
                Export as Plain Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
            <span className="font-medium text-muted-foreground">Job Name</span>
            <p className="font-semibold">: {requirement?.jobName}</p>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
            <span className="font-medium text-muted-foreground">Project Name</span>
            <p className="font-semibold">: {requirement?.projectName}</p>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
            <span className="font-medium text-muted-foreground">Requirement</span>
            <p className="font-semibold">: {requirement?.requirementName}</p>
          </div>
        </div>
      </div>

      {requirement?.status === "failed" && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-foreground">Test Case Generation Failed</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Failure Reason:</p>
              <p className="bg-muted p-3 rounded border">
                {requirement.reason || "No specific reason provided"}
              </p>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={backDialogOpen} onOpenChange={setBackDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBack} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {(testCases.length > 0 || requirement?.status !== "failed") && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Generated Test Cases (Total : {testCases.length})</h2>
            <div className="flex gap-2">
              <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset all changes?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all modifications and additionally added test cases. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Reset All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline" size="sm" onClick={addTestCase}>
                <Plus className="h-4 w-4 mr-2" />
                Add Test Case
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {testCases.map((testCase) => {
          const original = baselineTestCases.find(tc => tc.id === testCase.id)
          const isModified = original ? JSON.stringify(testCase) !== JSON.stringify(original) : true
          const isNewTestCase = !original

          return (
            <div key={testCase.id} className={`border rounded-lg p-6 bg-card ${isModified ? "border-blue-300 bg-blue-50/50" : ""} ${isNewTestCase ? "border-green-300 bg-green-50/20" : ""}`}>
              <form className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <label htmlFor={`summary-${testCase.id}`} className="text-sm font-medium text-foreground">
                      Summary *
                    </label>
                    <Input
                      id={`summary-${testCase.id}`}
                      value={testCase.summary}
                      onChange={(e) => updateTestCase(testCase.id, "summary", e.target.value)}
                      required
                      className={validationErrors[testCase.id]?.summary ? "border-red-500" : ""}
                    />
                    {validationErrors[testCase.id]?.summary && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors[testCase.id].summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-7">
                    {testCase.generatedBy === 'ai' ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        <Bot className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        <User className="h-3 w-3 mr-1" />
                        Manual
                      </Badge>
                    )}

                    {isModified && !isNewTestCase && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resetTestCase(testCase.id)}
                        title="Reset to original"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTestCase(testCase.id)}
                      title="Remove test case"
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`description-${testCase.id}`} className="text-sm font-medium text-foreground">
                    Description *
                  </label>
                  <Textarea
                    id={`description-${testCase.id}`}
                    value={testCase.description}
                    onChange={(e) => updateTestCase(testCase.id, "description", e.target.value)}
                    className={`resize-none max-h-32 overflow-y-auto ${validationErrors[testCase.id]?.description ? "border-red-500" : ""}`}
                    required
                  />
                  {validationErrors[testCase.id]?.description && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors[testCase.id].description}</p>
                  )}
                </div>
              </form>
            </div>
          )
        })}
          </div>
        </>
      )}
    </div>
  )
}