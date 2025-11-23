"use client"

import { useState } from "react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Bot, User, RotateCcw, Trash2, Edit2, Save, X, FileText, Scale, CheckSquare, Square } from "lucide-react"
import { TestCaseGeneratedBy } from "@/constants/shared-constants"
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

interface FunctionalDescription {
  type: "functional"
  purpose: string
  preconditions: string
  testing_procedure: string[]
  expected_result: string
  requirement_coverage: string
}

interface NonFunctionalDescription {
  type: "non-functional" | "non_functional"
  test_category: string
  preconditions: string
  testing_procedure: string[]
  expected_result: string
  acceptance_criteria: string
}

interface ComplianceDescription {
  type: "compliance"
  compliance_rule: string
  preconditions: string
  testing_procedure: string[]
  expected_result: string
  compliance_impact: string
}

type ParsedDescription = FunctionalDescription | NonFunctionalDescription | ComplianceDescription

interface TestCaseAccordionProps {
  testCase: TestCase
  isModified: boolean
  isNew: boolean
  isStale: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onUpdate: (id: string, field: keyof TestCase, value: string) => void
  onReset: (id: string) => void
  onDelete: (id: string) => void
  validationError?: { summary?: string; description?: string }
}

function parseDescription(description: string): ParsedDescription | null {
  try {
    return JSON.parse(description)
  } catch {
    return null
  }
}

function FunctionalTestDetails({ data, isEditing, onChange }: { 
  data: FunctionalDescription
  isEditing: boolean
  onChange: (data: FunctionalDescription) => void
}) {
  if (!isEditing) {
    return (
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">📌 Purpose:</span>
          <span>{data.purpose || 'NA'}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">⚙️ Preconditions:</span>
          <span>{data.preconditions || 'NA'}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">📝 Steps:</span>
          {data.testing_procedure && data.testing_procedure.length > 0 ? (
            <ol className="list-decimal list-inside space-y-1">
              {data.testing_procedure.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <span>NA</span>
          )}
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">✅ Expected:</span>
          <span>{data.expected_result || 'NA'}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">🎯 Coverage:</span>
          <span>{data.requirement_coverage || 'NA'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Purpose</label>
        <Textarea
          value={data.purpose}
          onChange={(e) => onChange({ ...data, purpose: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Preconditions</label>
        <Textarea
          value={data.preconditions}
          onChange={(e) => onChange({ ...data, preconditions: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Testing Procedure (one per line)</label>
        <Textarea
          value={data.testing_procedure.join("\n")}
          onChange={(e) => onChange({ ...data, testing_procedure: e.target.value.split("\n") })}
          className="mt-1"
          rows={4}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Expected Result</label>
        <Textarea
          value={data.expected_result}
          onChange={(e) => onChange({ ...data, expected_result: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Requirement Coverage</label>
        <Input
          value={data.requirement_coverage}
          onChange={(e) => onChange({ ...data, requirement_coverage: e.target.value })}
          className="mt-1"
        />
      </div>
    </div>
  )
}

function NonFunctionalTestDetails({ data, isEditing, onChange }: { 
  data: NonFunctionalDescription
  isEditing: boolean
  onChange: (data: NonFunctionalDescription) => void
}) {
  if (!isEditing) {
    return (
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">🏷️ Category:</span>
          <span className="font-medium">{data.test_category || 'NA'}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">⚙️ Preconditions:</span>
          <span>{data.preconditions || 'NA'}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">📝 Steps:</span>
          {data.testing_procedure && data.testing_procedure.length > 0 ? (
            <ol className="list-decimal list-inside space-y-1">
              {data.testing_procedure.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <span>NA</span>
          )}
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">✅ Expected:</span>
          <span>{data.expected_result || 'NA'}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">🎯 Acceptance:</span>
          <span>{data.acceptance_criteria || 'NA'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Test Category</label>
        <Input
          value={data.test_category}
          onChange={(e) => onChange({ ...data, test_category: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Preconditions</label>
        <Textarea
          value={data.preconditions}
          onChange={(e) => onChange({ ...data, preconditions: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Testing Procedure (one per line)</label>
        <Textarea
          value={data.testing_procedure.join("\n")}
          onChange={(e) => onChange({ ...data, testing_procedure: e.target.value.split("\n") })}
          className="mt-1"
          rows={4}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Expected Result</label>
        <Textarea
          value={data.expected_result}
          onChange={(e) => onChange({ ...data, expected_result: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Acceptance Criteria</label>
        <Textarea
          value={data.acceptance_criteria}
          onChange={(e) => onChange({ ...data, acceptance_criteria: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  )
}

function ComplianceTestDetails({ data, isEditing, onChange }: { 
  data: ComplianceDescription
  isEditing: boolean
  onChange: (data: ComplianceDescription) => void
}) {
  if (!isEditing) {
    return (
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">⚖️ Rule:</span>
          <span className="font-medium">{data.compliance_rule || 'NA'}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">⚙️ Preconditions:</span>
          <span>{data.preconditions || 'NA'}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">📝 Steps:</span>
          {data.testing_procedure && data.testing_procedure.length > 0 ? (
            <ol className="list-decimal list-inside space-y-1">
              {data.testing_procedure.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <span>NA</span>
          )}
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">✅ Expected:</span>
          <span>{data.expected_result || 'NA'}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium min-w-[120px]">⚠️ Impact:</span>
          <span>{data.compliance_impact || 'NA'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Compliance Rule</label>
        <Textarea
          value={data.compliance_rule}
          onChange={(e) => onChange({ ...data, compliance_rule: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Preconditions</label>
        <Textarea
          value={data.preconditions}
          onChange={(e) => onChange({ ...data, preconditions: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Testing Procedure (one per line)</label>
        <Textarea
          value={data.testing_procedure.join("\n")}
          onChange={(e) => onChange({ ...data, testing_procedure: e.target.value.split("\n") })}
          className="mt-1"
          rows={4}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Expected Result</label>
        <Textarea
          value={data.expected_result}
          onChange={(e) => onChange({ ...data, expected_result: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Compliance Impact</label>
        <Textarea
          value={data.compliance_impact}
          onChange={(e) => onChange({ ...data, compliance_impact: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  )
}

export function TestCaseAccordion({
  testCase,
  isModified,
  isNew,
  isStale,
  isSelected,
  onToggleSelect,
  onUpdate,
  onReset,
  onDelete,
  validationError
}: TestCaseAccordionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editedSummary, setEditedSummary] = useState(testCase.summary)
  const [editedDescription, setEditedDescription] = useState<ParsedDescription | null>(
    parseDescription(testCase.description)
  )

  const parsedDescription = parseDescription(testCase.description)
  const isCompliance = parsedDescription?.type === "compliance"
  const isNonFunctional = parsedDescription?.type === "non-functional" || parsedDescription?.type === "non_functional"

  const handleSave = () => {
    const trimmedSummary = editedSummary.trim()
    if (!trimmedSummary) {
      toast.error("Summary is required")
      return
    }
    onUpdate(testCase.id, "summary", editedSummary)
    if (editedDescription) {
      onUpdate(testCase.id, "description", JSON.stringify(editedDescription))
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedSummary(testCase.summary)
    setEditedDescription(parseDescription(testCase.description))
    setIsEditing(false)
  }

  return (
    <AccordionItem
      value={testCase.id}
      className={`border rounded-lg bg-card ${isModified && !isNew ? "ring-1 ring-blue-300/50" : ""} ${isNew ? "ring-1 ring-green-300/50" : ""}`}
    >
      <AccordionTrigger className="px-4 hover:no-underline data-[state=open]:border-b">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3 flex-1">
            <div
              onClick={(e) => {
                e.stopPropagation()
                onToggleSelect(testCase.id)
              }}
              className="shrink-0 cursor-pointer transition-opacity hover:opacity-80"
            >
              {isSelected ? (
                <CheckSquare className="h-5 w-5 text-green-600" />
              ) : (
                <Square className="h-5 w-5 text-muted-foreground opacity-40" />
              )}
            </div>
            {isCompliance ? (
              <Scale className="h-4 w-4 text-amber-600 shrink-0" />
            ) : isNonFunctional ? (
              <FileText className="h-4 w-4 text-purple-600 shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-blue-600 shrink-0" />
            )}
            <span className="text-left font-medium truncate">{testCase.summary || "Untitled Test Case"}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isNew && <Badge variant="outline" className="text-green-600 border-green-300">NEW</Badge>}
            {isModified && !isNew && <Badge variant="outline" className="text-blue-600 border-blue-300">MODIFIED</Badge>}
            {testCase.generatedBy === "ai" ? (
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                <Bot className="h-3 w-3 mr-1" />
                AI
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-600 border-green-300">
                <User className="h-3 w-3 mr-1" />
                Manual
              </Badge>
            )}
            {isCompliance ? (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Compliance
              </Badge>
            ) : isNonFunctional ? (
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                Non-Functional
              </Badge>
            ) : (
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Functional
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-4">
        <div className="space-y-4 pt-2">
          {isEditing ? (
            <>
              <div>
                <label className="text-sm font-medium">Summary *</label>
                <Input
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className={`mt-1 ${validationError?.summary ? "border-red-500" : ""}`}
                  disabled={isStale}
                />
                {validationError?.summary && (
                  <p className="text-sm text-red-500 mt-1">{validationError.summary}</p>
                )}
              </div>

              {editedDescription && parsedDescription?.type === "functional" && (
                <FunctionalTestDetails
                  data={editedDescription as FunctionalDescription}
                  isEditing={true}
                  onChange={setEditedDescription}
                />
              )}

              {editedDescription && (parsedDescription?.type === "non-functional" || parsedDescription?.type === "non_functional") && (
                <NonFunctionalTestDetails
                  data={editedDescription as NonFunctionalDescription}
                  isEditing={true}
                  onChange={setEditedDescription}
                />
              )}

              {editedDescription && parsedDescription?.type === "compliance" && (
                <ComplianceTestDetails
                  data={editedDescription as ComplianceDescription}
                  isEditing={true}
                  onChange={setEditedDescription}
                />
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={handleSave} disabled={isStale}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              {parsedDescription?.type === "functional" && (
                <FunctionalTestDetails
                  data={parsedDescription as FunctionalDescription}
                  isEditing={false}
                  onChange={() => {}}
                />
              )}

              {(parsedDescription?.type === "non-functional" || parsedDescription?.type === "non_functional") && (
                <NonFunctionalTestDetails
                  data={parsedDescription as NonFunctionalDescription}
                  isEditing={false}
                  onChange={() => {}}
                />
              )}

              {parsedDescription?.type === "compliance" && (
                <ComplianceTestDetails
                  data={parsedDescription}
                  isEditing={false}
                  onChange={() => {}}
                />
              )}

              {!parsedDescription && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Description:</p>
                  <p className="whitespace-pre-wrap">{testCase.description}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                {isModified && !isNew && (
                  <Button size="sm" variant="outline" onClick={() => onReset(testCase.id)} disabled={isStale}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} disabled={isStale}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600 hover:text-red-700"
                  disabled={isStale}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Test Case?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>Are you sure you want to delete this test case?</p>
                <p className="text-sm font-medium">Note: To apply the deletion, click the &quot;Save Changes&quot; button at the top. You can use the &quot;Reset&quot; button to recover this test case before saving.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { onDelete(testCase.id); setDeleteDialogOpen(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AccordionContent>
    </AccordionItem>
  )
}
