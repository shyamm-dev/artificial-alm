"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Save, Download, RotateCcw, ChevronDown, Loader2, ArrowLeft, XCircle, Search, Briefcase, FileText, Scale, Filter, CheckSquare, Square, X, FileCode, FileType, FolderKanban } from "lucide-react"
import { exportTestCasesToMarkdown, exportTestCasesToPlainText } from "@/lib/export-utils"
import { saveStandaloneTestCasesDraft } from "./actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TestCaseGeneratedBy } from "@/constants/shared-constants"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Accordion } from "@/components/ui/accordion"
import { StandaloneTestCaseAccordion } from "./standalone-test-case-accordion"

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
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<"markdown" | "plaintext">("markdown")
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, { summary?: string; description?: string }>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "functional" | "compliance" | "non-functional">("all")
  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set(initialTestCases.map(tc => tc.id)))

  const testCaseStats = useMemo(() => {
    const stats = { functional: 0, "non-functional": 0, compliance: 0 }
    testCases.forEach(tc => {
      try {
        const parsed = JSON.parse(tc.description)
        if (parsed.type === "functional") stats.functional++
        else if (parsed.type === "non_functional") stats["non-functional"]++
        else if (parsed.type === "compliance") stats.compliance++
      } catch {}
    })
    return stats
  }, [testCases])

  const filteredTestCases = useMemo(() => {
    return testCases.filter(tc => {
      const matchesSearch = tc.summary.toLowerCase().includes(searchQuery.toLowerCase())

      if (typeFilter === "all") return matchesSearch

      try {
        const parsed = JSON.parse(tc.description)
        const matchesType = parsed.type === typeFilter || (typeFilter === "non-functional" && parsed.type === "non_functional")
        return matchesSearch && matchesType
      } catch {
        return matchesSearch
      }
    })
  }, [testCases, searchQuery, typeFilter])

  if (!requirement) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Requirement not found</p>
      </div>
    )
  }

  const updateTestCase = (id: string, field: keyof StandaloneTestCase, value: string) => {
    if (field === 'summary' && value.length > 200) {
      toast.error('Summary cannot exceed 200 characters')
      return
    }

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

  const handleExportClick = (format: "markdown" | "plaintext") => {
    if (selectedTestCases.size === 0) {
      toast.error("Please select at least one test case to export.")
      return
    }
    if (hasChanges) {
      toast.error('You have unsaved changes. Please use the "Save Changes" button at the top right to sync them to the database before exporting.')
      return
    }
    setExportFormat(format)
    setExportDialogOpen(true)
  }

  const confirmExport = () => {
    const selected = testCases.filter(tc => selectedTestCases.has(tc.id))
    if (exportFormat === "markdown") {
      exportTestCasesToMarkdown(selected, initialTestCases, {
        issueKey: requirement.requirementName,
        summary: requirement.requirementName,
        jobName: requirement.jobName,
        projectName: requirement.projectName
      })
    } else {
      exportTestCasesToPlainText(selected, initialTestCases, {
        issueKey: requirement.requirementName,
        summary: requirement.requirementName,
        jobName: requirement.jobName,
        projectName: requirement.projectName
      })
    }
    setExportDialogOpen(false)
    toast.success(`Exported ${selected.length} test case(s) as ${exportFormat}`)
  }

  const getTestCaseType = (tc: StandaloneTestCase) => {
    try {
      const parsed = JSON.parse(tc.description)
      return parsed.type || "unknown"
    } catch {
      return "unknown"
    }
  }

  const selectedTestCasesList = testCases.filter(tc => selectedTestCases.has(tc.id))

  const toggleSelectAll = () => {
    if (selectedTestCases.size === testCases.length) {
      setSelectedTestCases(new Set())
    } else {
      setSelectedTestCases(new Set(testCases.map(tc => tc.id)))
    }
  }

  const toggleTestCase = (id: string) => {
    setSelectedTestCases(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
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
              <DropdownMenuItem onClick={() => handleExportClick("markdown")}>
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportClick("plaintext")}>
                Export as Plain Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-muted-foreground">Job Name:</span>
            <p className="font-semibold">{requirement?.jobName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-muted-foreground">Project:</span>
            <p className="font-semibold">{requirement?.projectName}</p>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-muted-foreground">Requirement:</span>
            <p className="font-semibold">{requirement?.requirementName}</p>
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

      <AlertDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <button
            onClick={() => setExportDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
          </button>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              {exportFormat === "markdown" ? (
                <FileCode className="h-5 w-5 text-purple-600" />
              ) : (
                <FileType className="h-5 w-5 text-gray-600" />
              )}
              <AlertDialogTitle>Export Test Cases as {exportFormat === "markdown" ? "Markdown" : "Plain Text"}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Export {selectedTestCasesList.length} test case(s)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Functional: {selectedTestCasesList.filter(tc => getTestCaseType(tc) === "functional").length}</span>
              </div>
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-purple-600" />
                <span>Non-Functional: {selectedTestCasesList.filter(tc => getTestCaseType(tc) === "non-functional" || getTestCaseType(tc) === "non_functional").length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-600" />
                <span>Compliance: {selectedTestCasesList.filter(tc => getTestCaseType(tc) === "compliance").length}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Test Cases to Export:</p>
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {selectedTestCasesList.map(tc => {
                  const type = getTestCaseType(tc)
                  return (
                    <div key={tc.id} className="flex items-center gap-2 p-2 border-b last:border-b-0 text-sm min-w-0">
                      {type === "functional" && <FileText className="h-4 w-4 text-blue-600 shrink-0" />}
                      {(type === "non-functional" || type === "non_functional") && <FolderKanban className="h-4 w-4 text-purple-600 shrink-0" />}
                      {type === "compliance" && <Scale className="h-4 w-4 text-amber-600 shrink-0" />}
                      <span className="flex-1 truncate min-w-0">{tc.summary}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {(testCases.length > 0 || requirement?.status !== "failed") && (
        <>
          <div className="border rounded-lg p-4 bg-card w-fit">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">Functional:</span>
                <span className="text-lg font-semibold">{testCaseStats.functional}</span>
              </div>
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">Non-Functional:</span>
                <span className="text-lg font-semibold">{testCaseStats["non-functional"]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-muted-foreground">Compliance:</span>
                <span className="text-lg font-semibold">{testCaseStats.compliance}</span>
              </div>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Total:</span>
                <span className="text-lg font-bold">{testCases.length}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">Test Cases</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="text-xs"
              >
                {selectedTestCases.size === testCases.length ? (
                  <CheckSquare className="h-4 w-4 mr-1" />
                ) : (
                  <Square className="h-4 w-4 mr-1" />
                )}
                {selectedTestCases.size === testCases.length ? "Deselect All" : "Select All"}
              </Button>
              <span className="text-sm text-muted-foreground">({selectedTestCases.size} selected)</span>
              <span className="text-xs text-muted-foreground italic">Note: Selected will be available for export action</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by summary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="functional">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Functional
                    </div>
                  </SelectItem>
                  <SelectItem value="non-functional">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-purple-600" />
                      Non-Functional
                    </div>
                  </SelectItem>
                  <SelectItem value="compliance">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-amber-600" />
                      Compliance
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
                      This will remove all modifications. Are you sure you want to continue?
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
            </div>
          </div>

          {filteredTestCases.length === 0 && testCases.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No test cases match your search or filter criteria.</p>
            </div>
          )}

          <Accordion type="multiple" className="space-y-4">
            {filteredTestCases.map((testCase) => {
              const original = baselineTestCases.find(tc => tc.id === testCase.id)
              const isModified = original ? JSON.stringify(testCase) !== JSON.stringify(original) : true
              const isNewTestCase = !original

              return (
                <StandaloneTestCaseAccordion
                  key={testCase.id}
                  testCase={testCase}
                  isModified={isModified}
                  isNew={isNewTestCase}
                  isSelected={selectedTestCases.has(testCase.id)}
                  onToggleSelect={toggleTestCase}
                  onUpdate={updateTestCase}
                  onReset={resetTestCase}
                  onDelete={removeTestCase}
                  validationError={validationErrors[testCase.id]}
                />
              )
            })}
          </Accordion>
        </>
      )}
    </div>
  )
}
