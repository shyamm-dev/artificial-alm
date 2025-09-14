"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Minus } from "lucide-react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { IconInfoCircle } from "@tabler/icons-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import type { JiraIssue } from "@/data-access-layer/types"
import { searchJiraIssues } from "../actions/actions"
import useDebounce from "@/hooks/use-debounce"
import { IssueSearchDialog } from "./form-components"

interface IssueSearchProps {
  form: any
  selectedProject: any
  selectedIssueTypes: string[]
  availableIssueTypes: any[]
  hasError?: boolean
}

export function IssueSearch({ form, selectedProject, selectedIssueTypes, availableIssueTypes, hasError }: IssueSearchProps) {
  const [selectedIssues, setSelectedIssues] = useState<JiraIssue[]>([])
  const [searchResults, setSearchResults] = useState<JiraIssue[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleSearch = useCallback(async (query: string) => {
    if (!selectedProject?.cloudId || !query.trim()) {
      setSearchResults([])
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsSearching(true)
    try {
      const result = await searchJiraIssues({
        cloudId: selectedProject.cloudId,
        projectId: selectedProject.id,
        filters: {
          text: query,
          issueType: selectedIssueTypes
        }
      })
      
      // Only update results if request wasn't cancelled
      if (!abortController.signal.aborted) {
        setSearchResults(result.issues)
      }
    } catch (error) {
      // Only handle error if request wasn't cancelled
      if (!abortController.signal.aborted) {
        setSearchResults([])
      }
    } finally {
      // Only update loading state if request wasn't cancelled
      if (!abortController.signal.aborted) {
        setIsSearching(false)
      }
    }
  }, [selectedProject?.cloudId, selectedIssueTypes])

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    if (debouncedSearchQuery) {
      handleSearch(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, handleSearch])

  const toggleIssue = (issue: JiraIssue) => {
    const isSelected = selectedIssues.some(i => i.id === issue.id)
    const newSelection = isSelected
      ? selectedIssues.filter(i => i.id !== issue.id)
      : [...selectedIssues, issue]

    setSelectedIssues(newSelection)
    form.setValue("issues", newSelection.map(i => i.id))
  }

  return (
    <FormItem>
      <FormLabel className="flex items-center gap-2">
        Issues
        <Tooltip>
          <TooltipTrigger asChild>
            <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Select specific issues to schedule for test case generation</p>
          </TooltipContent>
        </Tooltip>
      </FormLabel>
      <div className="space-y-2">
        <IssueSearchDialog
          selectedProject={selectedProject}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          searchResults={searchResults}
          selectedIssues={selectedIssues}
          toggleIssue={toggleIssue}
          selectedIssueTypes={selectedIssueTypes}
          availableIssueTypes={availableIssueTypes}
          hasError={hasError}
        />
        {selectedIssues.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedIssues.map((issue) => (
              <Badge key={issue.id} variant="secondary" className="flex items-center gap-1">
                {issue.fields.issuetype.iconUrl && (
                  <Image
                    src={issue.fields.issuetype.iconUrl}
                    alt={issue.fields.issuetype.name}
                    width={12}
                    height={12}
                    className="w-3 h-3"
                  />
                )}
                <span>{issue.key}</span>
                <Minus
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleIssue(issue)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  )
}