"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@uidotdev/usehooks"
import Image from "next/image"
import type { JiraSearchResponse } from "@/data-access-layer/types"
import { type JiraIssueSearchParams } from "@/lib/schemas/jira-search"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { UseFormReturn, FieldValues } from "react-hook-form"

interface JiraProject {
  id: string
  name: string
  cloudId: string
  avatar24: string | null
  issueTypes: Array<{ id: string; name: string; iconUrl: string | null }>
  compliance: { frameworks: string[] } | null
}

interface JiraSourceFieldsProps {
  form: UseFormReturn<FieldValues>
  projects: JiraProject[]
}

interface Requirement {
  id: string
  name: string
  iconUrl: string
  issueTypeId: string
  scheduledStatus: string | null
}

export function JiraSourceFields({ form, projects }: JiraSourceFieldsProps) {
  const [open, setOpen] = useState(false)
  const [issueTypesOpen, setIssueTypesOpen] = useState(false)
  const [requirementsOpen, setRequirementsOpen] = useState(false)
  const [searchText, setSearchText] = useState("")

  const selectedProject = form.watch("projectId")
  const selectedIssueTypes = form.watch("issueTypeIds")
  const selectedRequirements = form.watch("issueIds")
  const currentProject = projects.find(p => p.id === selectedProject)
  const availableIssueTypes = useMemo(() => currentProject?.issueTypes || [], [currentProject?.issueTypes])

  const debouncedSearchText = useDebounce(searchText, 500)

  const { data: jiraIssues, isLoading, error } = useQuery<JiraSearchResponse>({
    queryKey: ["searchJiraIssues", currentProject?.cloudId, selectedProject, selectedIssueTypes, debouncedSearchText],
    queryFn: async () => {
      const requestBody: JiraIssueSearchParams = {
        cloudId: currentProject!.cloudId,
        projectId: selectedProject,
        filters: { text: debouncedSearchText, issueType: selectedIssueTypes }
      }
      const response = await fetch("/api/atlassian/searchJiraIssues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      })
      if (!response.ok) throw new Error("Failed to fetch issues")
      return response.json()
    },
    enabled: !!currentProject?.cloudId && !!currentProject?.id,
    refetchOnWindowFocus: false
  })

  const searchResults = useMemo(() => {
    return jiraIssues?.issues?.map((issue) => ({
      id: issue.key,
      name: issue.fields.summary,
      iconUrl: issue.fields.issuetype.iconUrl,
      issueTypeId: issue.fields.issuetype.id,
      scheduledStatus: issue.scheduledStatus || null
    })) || []
  }, [jiraIssues?.issues])

  const [selectedRequirementCache, setSelectedRequirementCache] = useState<Map<string, Requirement>>(new Map())

  useEffect(() => {
    if (searchResults.length > 0) {
      setSelectedRequirementCache(prev => {
        const newCache = new Map(prev)
        searchResults.forEach(result => {
          newCache.set(result.id, result)
        })
        return newCache
      })
    }
  }, [searchResults])

  const selectedRequirementDetails = useMemo(() => {
    return selectedRequirements.map((id: string) => selectedRequirementCache.get(id)).filter(Boolean)
  }, [selectedRequirements, selectedRequirementCache])

  const requirementOptions = searchResults

  useEffect(() => {
    form.setValue("issueIds", [])

    // Set Story as default issue type if available
    if (selectedProject && availableIssueTypes.length > 0) {
      const storyIssueType = availableIssueTypes.find(type => type.name.toLowerCase() === 'story')
      if (storyIssueType && (!selectedIssueTypes || selectedIssueTypes.length === 0)) {
        form.setValue("issueTypeIds", [storyIssueType.id])
      }
    }
  }, [selectedProject, availableIssueTypes, form, selectedIssueTypes])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-base">Project</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground",
                          fieldState.error && "!border-destructive"
                        )}
                      >
                        {field.value
                          ? projects.find((project) => project.id === field.value)?.name
                          : "Select project..."}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-screen max-w-md p-0">
                    <Command>
                      <CommandInput placeholder="Search project..." />
                      <CommandList>
                        <CommandEmpty>No project found.</CommandEmpty>
                        <CommandGroup>
                          {projects.map((project) => (
                            <CommandItem
                              value={project.name}
                              key={project.id}
                              onSelect={() => {
                                form.setValue("projectId", project.id)
                                form.setValue("issueTypeIds", [])
                                form.setValue("issueIds", [])
                                form.clearErrors("projectId")
                                setOpen(false)
                              }}
                              className="flex justify-start"
                            >
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center min-w-0 flex-1">
                                  {project.avatar24 && (
                                    <Image src={project.avatar24} alt="" width={24} height={24} className="w-6 h-6 mr-2 rounded-full flex-shrink-0" />
                                  )}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="truncate">{project.name}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{project.name}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <CheckIcon
                                  className={cn("h-4 w-4",
                                    project.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          {currentProject && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Compliance:</span>
              {currentProject.compliance?.frameworks?.length ? (
                <div className="flex flex-wrap gap-1">
                  {currentProject.compliance.frameworks.map((framework, index) => (
                    <Badge key={index} variant="secondary">
                      {framework}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">NA</span>
              )}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="issueTypeIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Issue Types (optional)</FormLabel>
                <Popover open={issueTypesOpen} onOpenChange={setIssueTypesOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={!selectedProject}
                        className={cn(
                          "w-full justify-between",
                          !field.value?.length && "text-muted-foreground"
                        )}
                      >
                        {field.value?.length
                          ? `${field.value.length} selected`
                          : "All options selected by default"}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-screen max-w-md p-0">
                    <Command>
                      <CommandInput placeholder="Search issue types..." />
                      <CommandList>
                        <CommandEmpty>No issue type found.</CommandEmpty>
                        <CommandGroup>
                          {availableIssueTypes.map((issueType) => (
                            <CommandItem
                              value={issueType.name}
                              key={issueType.id}
                              onSelect={() => {
                                const currentValues = field.value || []
                                const isSelected = currentValues.includes(issueType.id)
                                const newValues = isSelected
                                  ? currentValues.filter((id: string) => id !== issueType.id)
                                  : [...currentValues, issueType.id]
                                form.setValue("issueTypeIds", newValues)
                              }}
                              className="flex justify-between"
                            >
                              <div className="flex items-center min-w-0 flex-1">
                                {issueType.iconUrl && (
                                  <Image src={issueType.iconUrl} alt="" width={16} height={16} className="w-4 h-4 mr-2 flex-shrink-0" />
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="truncate">{issueType.name}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{issueType.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <CheckIcon
                                className={cn(
                                  "h-4 w-4",
                                  field.value?.includes(issueType.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedIssueTypes && selectedIssueTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedIssueTypes.map((issueTypeId: string) => {
                const issueType = availableIssueTypes.find(it => it.id === issueTypeId)
                return issueType ? (
                  <Badge key={issueTypeId} variant="secondary" className="flex items-center gap-1">
                    {issueType.iconUrl && (
                      <Image src={issueType.iconUrl} alt="" width={12} height={12} className="w-3 h-3" />
                    )}
                    {issueType.name}
                  </Badge>
                ) : null
              })}
            </div>
          )}
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormField
            control={form.control}
            name="issueIds"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={cn("text-base", fieldState.error && selectedProject && "text-destructive")}>Requirements <span className="italic text-muted-foreground">(fetched based on selected project and issue types)</span></FormLabel>
                <Popover open={requirementsOpen} onOpenChange={setRequirementsOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={!selectedProject}
                        className={cn(
                          "w-full justify-between",
                          !field.value?.length && "text-muted-foreground",
                          fieldState.error && selectedProject && "!border-destructive"
                        )}
                      >
                        {field.value?.length
                          ? `${field.value.length} selected`
                          : "Select requirements..."}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-screen max-w-md p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Type to search requirements..."
                        value={searchText}
                        onValueChange={(value) => setSearchText(value.trim())}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isLoading ? "Loading..." : error ? "Error loading requirements" : "No requirement found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {requirementOptions.map((requirement) => {
                            const isInProgress = requirement.scheduledStatus === "in_progress"

                            return (
                              <CommandItem
                                key={requirement.id}
                                value={requirement.id}
                                disabled={isInProgress}
                                onSelect={() => {
                                  if (isInProgress) return
                                  const currentValues = field.value || []
                                  const isSelected = currentValues.includes(requirement.id)
                                  const newValues = isSelected
                                    ? currentValues.filter((id: string) => id !== requirement.id)
                                    : [...currentValues, requirement.id]
                                  form.setValue("issueIds", newValues)
                                  if (newValues.length > 0) {
                                    form.clearErrors("issueIds")
                                  }
                                }}
                                className={`flex justify-between items-center gap-2 ${isInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0">
                                    {requirement.iconUrl && (
                                      <Image src={requirement.iconUrl} alt="" width={12} height={12} className="w-3 h-3" />
                                    )}
                                    {requirement.id}
                                  </Badge>
                                  <span className="truncate">{requirement.name}</span>
                                </div>
                                <CheckIcon
                                  className={cn(
                                    "h-4 w-4",
                                    field.value?.includes(requirement.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedProject && <FormMessage />}
              </FormItem>
            )}
          />
          {selectedRequirements && selectedRequirements.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">Requirements added so far</h4>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Remove all
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove all requirements?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all selected requirements. You can add them back by selecting from the dropdown.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => form.setValue("issueIds", [])}>
                        Remove all
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {selectedRequirements.map((requirementId: string) => {
                const requirement = selectedRequirementDetails.find((req: Requirement) => req?.id === requirementId) || requirementOptions.find(req => req.id === requirementId)
                return requirement ? (
                  <Badge key={requirementId} variant="outline" className="block w-full text-left justify-start p-2 h-auto">
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0">
                          {requirement.iconUrl && (
                            <Image src={requirement.iconUrl} alt="" width={12} height={12} className="w-3 h-3" />
                          )}
                          {requirement.id}
                        </Badge>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate">{requirement.name}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{requirement.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => {
                          const newValues = selectedRequirements.filter((id: string) => id !== requirementId)
                          form.setValue("issueIds", newValues)
                        }}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </Badge>
                ) : null
              })}
            </div>
          )}
        </div>
        <div className="text-sm space-y-1 p-3 min-h-24 italic">
          <p className="font-medium text-white">ℹ️ Note:</p>
          <p className="text-white">Disabled options indicate issues with testcase generation currently in progress.</p>
          {(() => {
            const issuesWithExistingTestcases = selectedRequirements
              .map((id: string) => selectedRequirementCache.get(id) || requirementOptions.find((req: Requirement) => req.id === id))
              .filter((req: Requirement) => req && req.scheduledStatus && req.scheduledStatus !== "in_progress")

            return issuesWithExistingTestcases.length > 0 ? (
              <div className="text-white">
                <strong>Selected issues that already have testcase generated and pending review will have their previous testcase generation marked as stale if you proceed:</strong> <div className="font-medium text-red-600 break-words">{issuesWithExistingTestcases.map((req: Requirement) => req.id).join(", ")}</div>
              </div>
            ) : (
              <div className="text-white"><strong>Selected issues that already have testcase generated and pending review will have their previous testcase generation marked as stale if you proceed.</strong></div>
            )
          })()}
        </div>
      </div>
    </>
  )
}
