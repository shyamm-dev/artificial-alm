"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState, use, useRef, useEffect } from "react"
import Image from "next/image"
import { getUserAccessibleProjects } from "@/db/queries/user-project-queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
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
  const [requirementOptions, setRequirementOptions] = useState<{id: string, name: string}[]>([])
  const [popoverWidth, setPopoverWidth] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth)
    }
  }, [requirementsOpen])
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

  // Mock function to simulate dynamic requirement fetching based on project and issue types
  const fetchRequirements = async (query: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300))
    const mockRequirements = [
      { id: "req1", name: "GDPR Compliance Documentation" },
      { id: "req2", name: "Security Risk Assessment" },
      { id: "req3", name: "Data Privacy Impact Assessment" },
      { id: "req4", name: "Audit Trail Implementation" },
      { id: "req5", name: "Access Control Review" },
    ]
    // Filter based on query and selected project/issue types
    return mockRequirements.filter(req =>
      req.name.toLowerCase().includes(query.toLowerCase())
    )
  }

  function onSubmit(data: JobFormData) {
    console.log(data)
  }

  function handleCancel() {
    router.push("/scheduler")
  }

  return (
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
                      <PopoverContent className="w-full p-0">
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
                                    setOpen(false)
                                  }}
                                  className="flex justify-start"
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center">
                                      {project.avatar24 && (
                                        <Image src={project.avatar24} alt="" width={24} height={24} className="w-6 h-6 mr-2 rounded-full" />
                                      )}
                                      {project.name}
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
              {currentProject?.compliance?.frameworks && (
                <div className="flex flex-wrap gap-1">
                  {currentProject.compliance.frameworks.map((framework, index) => (
                    <Badge key={index} variant="secondary">
                      {framework}
                    </Badge>
                  ))}
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
                      <PopoverContent className="w-full p-0">
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
                                  <div className="flex items-center">
                                    {issueType.iconUrl && (
                                      <Image src={issueType.iconUrl} alt="" width={16} height={16} className="w-4 h-4 mr-2" />
                                    )}
                                    {issueType.name}
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
                            ref={triggerRef}
                            variant="outline"
                            role="combobox"
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
                      <PopoverContent className="p-0" style={{ width: popoverWidth }}>
                        <Command>
                          <CommandInput
                            placeholder="Search requirements..."
                            onValueChange={async (value) => {
                              if (value) {
                                const options = await fetchRequirements(value)
                                setRequirementOptions(options)
                              }
                            }}
                          />
                          <CommandList>
                            <CommandEmpty>No requirement found.</CommandEmpty>
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
                                  className="flex justify-between"
                                >
                                  <div className="flex items-center">
                                    {requirement.name}
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
                  {selectedRequirements.map((requirementId) => {
                    const requirement = requirementOptions.find(req => req.id === requirementId)
                    return requirement ? (
                      <Badge key={requirementId} variant="outline" className="block w-full text-left justify-start p-2 h-auto">
                        {requirement.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
            {/* Requirements Field - End */}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="destructive" onClick={handleCancel}>Cancel</Button>
            <Button type="submit">Create Job</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
