"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Save, Download, Upload, RotateCcw, Plus, Trash2, Bot, User, ChevronDown, Loader2, ArrowLeft, XCircle, Archive } from "lucide-react"
import { exportTestCasesToMarkdown, exportTestCasesToPlainText } from "@/lib/export-utils"
import { saveTestCasesDraft } from "./actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TestCaseGeneratedBy } from "@/constants/shared-constants"
import Image from "next/image"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TestCase {
  id: string
  issueId: string
  summary: string
  description: string
  generatedBy: TestCaseGeneratedBy
  modifiedByUserId: string | null
  createdAt: string
  updatedAt: string
}

interface Issue {
  id: string
  issueId: string
  issueKey: string
  summary: string
  status: string
  reason: string | null
  projectName: string
  projectId: string
  projectAvatar: string | null
  cloudId: string
  jobName: string
  issueTypeIcon: string | null
  issueTypeName: string
}

interface IssueType {
  id: string
  name: string
  iconUrl: string | null
}

interface ReviewTestCasesProps {
  issue: Issue
  issueTypes: IssueType[]
  testCases: TestCase[]
  tab: string
}

export function ReviewTestCases({ issue, issueTypes, testCases: initialTestCases }: ReviewTestCasesProps) {
  const router = useRouter()
  const [testCases, setTestCases] = useState(initialTestCases)
  const [baselineTestCases, setBaselineTestCases] = useState(initialTestCases)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [backDialogOpen, setBackDialogOpen] = useState(false)
  const [deployDialogOpen, setDeployDialogOpen] = useState(false)
  const [selectedIssueTypeId, setSelectedIssueTypeId] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, { summary?: string; description?: string }>>({})

  if (!issue) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Issue not found</p>
      </div>
    )
  }

  const updateTestCase = (id: string, field: keyof TestCase, value: string) => {
    if (isStale) return
    
    setTestCases(prev => prev.map(tc =>
      tc.id === id ? { ...tc, [field]: value, updatedAt: new Date().toISOString() } : tc
    ))
    
    // Clear validation error for this field if value is not empty
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
    const newTestCase: TestCase = {
      id: `new-${Date.now()}`,
      issueId: issue?.id || '',
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
  const isStale = issue?.status === "stale"
  
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
      await saveTestCasesDraft(testCases)
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
    exportTestCasesToMarkdown(testCases, initialTestCases, issue)
  }

  const handleExportPlainText = () => {
    exportTestCasesToPlainText(testCases, initialTestCases, issue)
  }

  const handleDeployToJira = () => {
    if (!validateTestCases()) {
      toast.error("Please fix validation errors before deploying.")
      return
    }
    setDeployDialogOpen(true)
  }

  const confirmDeploy = async () => {
    if (!selectedIssueTypeId) {
      toast.error("Please select an issue type.")
      return
    }

    setIsDeploying(true)
    try {
      const { deployTestCasesToJira } = await import("./deploy-actions")
      await deployTestCasesToJira({
        issueId: issue.id,
        issueTypeId: selectedIssueTypeId,
        testCases: testCases.map(tc => ({
          id: tc.id,
          summary: tc.summary,
          description: tc.description
        }))
      })
      
      setDeployDialogOpen(false)
      setSelectedIssueTypeId("")
      toast.success("Test cases deployed to Jira successfully!")
      router.push('/scheduler')
    } catch (error) {
      console.error("Failed to deploy to Jira:", error)
      toast.error("Failed to deploy test cases to Jira. Please try again.")
    } finally {
      setIsDeploying(false)
    }
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
          <Button variant="outline" onClick={handleSaveDraft} disabled={isStale || !hasChanges || isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={issue?.status === "failed"}>
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
          <Button onClick={handleDeployToJira} disabled={isDeploying || issue?.status === "failed" || issue?.status === "stale"}>
            {isDeploying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isDeploying ? "Deploying..." : "Deploy to Jira"}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
            <span className="font-medium text-muted-foreground">Job Name</span>
            <p className="font-semibold">: {issue?.jobName}</p>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
            <span className="font-medium text-muted-foreground">Project Name</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">:</span>
              {issue?.projectAvatar && (
                <Image src={issue.projectAvatar} alt="Project" width={16} height={16} className="rounded" />
              )}
              <p className="font-semibold">{issue?.projectName}</p>
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
            <span className="font-medium text-muted-foreground">Requirement</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">:</span>
              {issue?.issueTypeIcon && (
                <Image src={issue.issueTypeIcon} alt="Issue Type" width={16} height={16} />
              )}
              <p className="font-semibold">{issue?.issueKey} - {issue?.summary}</p>
            </div>
          </div>
        </div>
      </div>

      {issue?.status === "failed" && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-foreground">Test Case Generation Failed</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Failure Reason:</p>
              <p className="bg-muted p-3 rounded border">
                {issue.reason || "No specific reason provided"}
              </p>
            </div>
          </div>
        </div>
      )}

      {issue?.status === "stale" && (
        <div className="border rounded-lg p-4 bg-gray-200 border-gray-400">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Stale Test Cases</h3>
            </div>
            <div className="text-sm text-gray-800">
              <p className="font-medium mb-2">Notice:</p>
              <p className="bg-gray-300 p-3 rounded border border-gray-400">
                This testcase generation has been marked as stale because updated testcases for this issue are available. These testcases cannot be deployed to Jira but can still be exported for reference.
              </p>
              {issue.reason && (
                <>
                  <p className="font-medium mb-2 mt-4">Original Failure Reason:</p>
                  <p className="bg-gray-300 p-3 rounded border border-gray-400">
                    {issue.reason}
                  </p>
                </>
              )}
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

      <AlertDialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deploy Test Cases to Jira</AlertDialogTitle>
            <AlertDialogDescription>
              Select the issue type for the test cases that will be created in Jira.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Select Issue Type to Create</label>
            <Select value={selectedIssueTypeId} onValueChange={setSelectedIssueTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an issue type..." />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      {type.iconUrl && (
                        <Image src={type.iconUrl} alt={type.name} width={16} height={16} />
                      )}
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeploying}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeploy} disabled={isDeploying || !selectedIssueTypeId}>
              {isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                "Deploy"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {(testCases.length > 0 || issue?.status !== "failed") && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Generated Test Cases (Total : {testCases.length})</h2>
            <div className="flex gap-2">
              <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={issue?.status === "stale"}>
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
              <Button variant="outline" size="sm" onClick={addTestCase} disabled={issue?.status === "stale"}>
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
                      disabled={isStale}
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
                        disabled={issue?.status === "stale"}
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
                      disabled={issue?.status === "stale"}
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
                    disabled={isStale}
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

