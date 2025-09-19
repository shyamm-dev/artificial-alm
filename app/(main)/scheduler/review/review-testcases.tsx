"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Save, Download, Upload, RotateCcw, Plus, Trash2, Bot, User, ChevronDown, Loader2 } from "lucide-react"
import { exportTestCasesToMarkdown, exportTestCasesToPlainText } from "@/lib/export-utils"
import { saveTestCasesDraft } from "./actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TestCaseGeneratedBy } from "@/constants/shared-constants"
import Image from "next/image"
import { toast } from "sonner"

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
  issueKey: string
  summary: string
  projectName: string
  projectId: string
  projectAvatar: string | null
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
}

export function ReviewTestCases({ issue, issueTypes, testCases: initialTestCases }: ReviewTestCasesProps) {
  const [testCases, setTestCases] = useState(initialTestCases)
  const [baselineTestCases, setBaselineTestCases] = useState(initialTestCases)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!issue) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Issue not found</p>
      </div>
    )
  }

  const updateTestCase = (id: string, field: keyof TestCase, value: string) => {
    setTestCases(prev => prev.map(tc =>
      tc.id === id ? { ...tc, [field]: value, updatedAt: new Date().toISOString() } : tc
    ))
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
    setTestCases(prev => [...prev, newTestCase])
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

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      await saveTestCasesDraft(testCases)
      setBaselineTestCases(testCases)
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
    console.log("Deploying to Jira:", testCases, "Available issue types:", issueTypes)
    // TODO: Show popup with issue type selection
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Review Test Cases
        </h1>
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
              <Button variant="outline">
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
          <Button onClick={handleDeployToJira}>
            <Upload className="h-4 w-4 mr-2" />
            Deploy to Jira
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
                    />
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
                    className="resize-none max-h-32 overflow-y-auto"
                    required
                  />
                </div>


              </form>
            </div>
          )
        })}
      </div>
    </div>
  )
}

