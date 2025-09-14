"use client"

import { use, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { IconInfoCircle } from "@tabler/icons-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"
import { schedulerJobSchema, type SchedulerJobFormData } from "@/lib/schemas/scheduler-schema"
import { getUserAccessibleProjects } from "@/db/queries/user-project-queries"
import { JobNameField } from "./form-components"
import { IssueSearch } from "./issue-search"

type Projects = Awaited<ReturnType<typeof getUserAccessibleProjects>>

interface SchedulerJobFormProps {
  userProjectsPromise: Promise<Projects>
}


export function SchedulerJobForm({ userProjectsPromise }: SchedulerJobFormProps) {
  const projects = use(userProjectsPromise)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>([])
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false)


  const form = useForm<SchedulerJobFormData>({
    resolver: zodResolver(schedulerJobSchema),
    defaultValues: {
      jobName: "",
      projects: [],
      issueTypes: [],
      issues: [],
    },
  })

  const onSubmit = (data: SchedulerJobFormData) => {
    // TODO: Implement actual form submission
    console.log(data)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const availableIssueTypes = selectedProject?.issueTypes || []

  return (
    <div className="rounded-lg border p-6">
      <TooltipProvider>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <JobNameField form={form} />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projects"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      Project
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select the Jira project to scan for issues</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "h-10 w-full justify-between",
                              !selectedProjectId && "text-muted-foreground",
                              fieldState.error && "border-red-500 focus:border-red-500"
                            )}
                          >
                            {selectedProject
                              ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={selectedProject.avatar24 || undefined} alt={selectedProject.name} />
                                    <AvatarFallback className="text-xs">
                                      {selectedProject.key?.charAt(0) || selectedProject.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{selectedProject.name}</span>
                                </div>
                              )
                              : "Select project"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search project..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No project found.</CommandEmpty>
                            <CommandGroup>
                              {projects.map((project) => (
                                <CommandItem
                                  value={project.name}
                                  key={project.id}
                                  onSelect={() => {
                                    setSelectedProjectId(project.id)
                                    field.onChange([project.id])
                                    setSelectedIssueTypes([])
                                    form.setValue("issueTypes", [])
                                    setProjectPopoverOpen(false)
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={project.avatar24 || undefined} alt={project.name} />
                                      <AvatarFallback className="text-xs">
                                        {project.key?.charAt(0) || project.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{project.name}</span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      project.id === selectedProjectId
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
                    {selectedProject?.compliance?.frameworks && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-sm text-muted-foreground">Compliance:</span>
                        {selectedProject.compliance.frameworks.map((framework, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {framework}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issueTypes"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      Issue Types (Optional)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Filter by specific issue types. Leave empty to scan all types</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={!selectedProjectId}
                            className={cn(
                              "h-10 w-full justify-between",
                              selectedIssueTypes.length === 0 && "text-muted-foreground"
                            )}
                          >
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              {selectedIssueTypes.length > 0 ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {selectedIssueTypes.map(typeId => {
                                    const issueType = availableIssueTypes.find(t => t.id === typeId)
                                    return issueType ? (
                                      <Badge key={typeId} variant="secondary" className="flex items-center gap-1 text-xs">
                                        {issueType.iconUrl ? (
                                          <Image
                                            src={issueType.iconUrl}
                                            alt={issueType.name}
                                            width={12}
                                            height={12}
                                            className="w-3 h-3"
                                          />
                                        ) : (
                                          <div className="w-3 h-3 rounded bg-green-500"></div>
                                        )}
                                        <span>{issueType.name}</span>
                                      </Badge>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <span>Select issue types</span>
                              )}
                            </div>
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search issue type..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No issue type found.</CommandEmpty>
                            <CommandGroup>
                              {availableIssueTypes.map((issueType) => (
                                <CommandItem
                                  value={issueType.name}
                                  key={issueType.id}
                                  onSelect={() => {
                                    const isSelected = selectedIssueTypes.includes(issueType.id)
                                    const newSelection = isSelected
                                      ? selectedIssueTypes.filter(id => id !== issueType.id)
                                      : [...selectedIssueTypes, issueType.id]
                                    setSelectedIssueTypes(newSelection)
                                    field.onChange(newSelection)
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    {issueType.iconUrl ? (
                                      <Image
                                        src={issueType.iconUrl}
                                        alt={issueType.name}
                                        width={16}
                                        height={16}
                                        className="w-4 h-4"
                                      />
                                    ) : (
                                      <div className="w-4 h-4 rounded bg-green-500"></div>
                                    )}
                                    <span>{issueType.name}</span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      selectedIssueTypes.includes(issueType.id)
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
            </div>

            <FormField
              control={form.control}
              name="issues"
              render={({ fieldState }) => (
                <IssueSearch
                  form={form}
                  selectedProject={selectedProject}
                  selectedIssueTypes={selectedIssueTypes}
                  availableIssueTypes={availableIssueTypes}
                  hasError={!!fieldState.error}
                />
              )}
            />

            <div className="flex justify-end gap-2">
              <Button variant="destructive" asChild>
                <Link href="/scheduler">
                  Cancel
                </Link>
              </Button>
              <Button type="submit">
                Create Job
              </Button>
            </div>
          </form>
        </Form>
      </TooltipProvider>
    </div>
  )
}
