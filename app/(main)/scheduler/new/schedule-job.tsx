"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState, use, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@uidotdev/usehooks"
import Image from "next/image"
import { getUserAccessibleProjects } from "@/db/queries/user-project-queries"
import type { JiraSearchResponse } from "@/data-access-layer/types"
import { type JiraIssueSearchParams } from "@/lib/schemas/jira-search"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const jobSchema = z.object({
  jobName: z.string().min(3, "Job name is required"),
  project: z.string().min(1, "Project is required"),
  issueTypes: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
})

type JobFormData = z.infer<typeof jobSchema>
interface ScheduleJobProps {
  userProjectsPromise: Promise<Awaited<ReturnType<typeof getUserAccessibleProjects>>>
}

export function ScheduleJob({ userProjectsPromise }: ScheduleJobProps) {
  const projects = use(userProjectsPromise)
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [issueTypesOpen, setIssueTypesOpen] = useState(false)
  const [requirementsOpen, setRequirementsOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [searchText, setSearchText] = useState("")


  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobName: "",
      project: "",
      issueTypes: [],
      requirements: [],
    },
  })

  const selectedProject = form.watch("project")
  const selectedIssueTypes = form.watch("issueTypes")
  const selectedRequirements = form.watch("requirements")
  const currentProject = projects.find(p => p.id === selectedProject)
  const availableIssueTypes = currentProject?.issueTypes || []

  const debouncedSearchText = useDebounce(searchText, 500);

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

  const requirementOptions = jiraIssues?.issues?.map((issue) => ({
    id: issue.key,
    name: issue.fields.summary,
    iconUrl: issue.fields.issuetype.iconUrl,
    issueTypeId: issue.fields.issuetype.id
  })) || []

  // Clear requirements when project changes
  useEffect(() => {
    form.setValue("requirements", [])
  }, [selectedProject, form])

  // Reset requirements when issue types change
  useEffect(() => {
    form.setValue("requirements", [])
  }, [selectedIssueTypes, form])

  function onSubmit(data: JobFormData) {
    console.log(data)
  }

  function handleCancel() {
    router.push("/scheduler")
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg p-6">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            {/* Job Name Field - Start */}
            <FormField
              control={form.control}
              name="jobName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Job Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter job name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Job Name Field - End */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Project Field - Start */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
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
                                !field.value && "text-muted-foreground"
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
                                      form.setValue("project", project.id)
                                      form.setValue("issueTypes", [])
                                      form.setValue("requirements", [])
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
              {/* Project Field - End */}
              {/* Issue Types Field - Start */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="issueTypes"
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
                                        ? currentValues.filter(id => id !== issueType.id)
                                        : [...currentValues, issueType.id]
                                      form.setValue("issueTypes", newValues)
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
                    {selectedIssueTypes.map((issueTypeId) => {
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
              {/* Issue Types Field - End */}
            </div>
            <Separator />
            {/* Requirements Field - Start */}
            <div className="w-full md:w-1/2">
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Requirements <span className="italic text-muted-foreground">(fetched based on selected project and issue types)</span></FormLabel>
                    <Popover open={requirementsOpen} onOpenChange={setRequirementsOpen}>
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
                              {requirementOptions.map((requirement) => (
                                <CommandItem
                                  value={requirement.name}
                                  key={requirement.id}
                                  onSelect={() => {
                                    const currentValues = field.value || []
                                    const isSelected = currentValues.includes(requirement.id)
                                    const newValues = isSelected
                                      ? currentValues.filter(id => id !== requirement.id)
                                      : [...currentValues, requirement.id]
                                    form.setValue("requirements", newValues)
                                  }}
                                  className="flex justify-between items-center gap-2"
                                >
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
                                  <CheckIcon
                                    className={cn(
                                      "h-4 w-4",
                                      field.value?.includes(requirement.id)
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
                          <AlertDialogAction onClick={() => form.setValue("requirements", [])}>
                            Remove all
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  {selectedRequirements.map((requirementId) => {
                    const requirement = requirementOptions.find(req => req.id === requirementId)
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
                              const newValues = selectedRequirements.filter(id => id !== requirementId)
                              form.setValue("requirements", newValues)
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
            {/* Requirements Field - End */}
          </div>
          <div className="flex justify-end gap-2">
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">Cancel</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel job creation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All your progress will be lost. Are you sure you want to cancel?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    setCancelDialogOpen(false)
                    setTimeout(() => router.push("/scheduler"), 100)
                  }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Cancel job
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="submit">Create Job</Button>
          </div>
        </form>
        </Form>
      </div>
    </TooltipProvider>
  )
}
