"use client"

import { useForm, type UseFormReturn, type FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, use, useRef, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { getUserAccessibleProjects } from "@/db/queries/user-project-queries"
import { getStandaloneProjects } from "@/db/queries/standalone-project-queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { CheckIcon, ChevronsUpDownIcon, FolderIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { JiraSourceFields } from "./jira-source-fields"
import { StandaloneSourceFields } from "./standalone-source-fields"
import { scheduleJobFormSchema } from "@/lib/schemas/schedule-job"
import { standaloneScheduleJobSchema } from "@/lib/schemas/standalone-schedule-job"
import { z } from "zod"

type JobFormData = z.infer<typeof scheduleJobFormSchema> | z.infer<typeof standaloneScheduleJobSchema>
interface ScheduleJobProps {
  userProjectsPromise: Promise<Awaited<ReturnType<typeof getUserAccessibleProjects>>>
  standaloneProjectsPromise: Promise<Awaited<ReturnType<typeof getStandaloneProjects>>>
}

export function ScheduleJob({ userProjectsPromise, standaloneProjectsPromise }: ScheduleJobProps) {
  const jiraProjects = use(userProjectsPromise)
  const standaloneProjectsData = use(standaloneProjectsPromise)
  const standaloneProjects = standaloneProjectsData.map(item => ({
    id: item.project.id,
    name: item.project.name,
    description: item.project.description,
    compliance: item.compliance
  }))
  const router = useRouter()
  const [sourceOpen, setSourceOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successSource, setSuccessSource] = useState<"jira" | "standalone">("jira")
  const standaloneValidateRef = useRef<{ validate: () => boolean; getRequirements: () => Array<{ id: string; name: string; content: string; file: File | null }> }>({
    validate: () => true,
    getRequirements: () => []
  })


  const form = useForm<JobFormData>({
    resolver: async (values, context, options) => {
      const schema = values.source === "standalone" ? standaloneScheduleJobSchema : scheduleJobFormSchema
      return zodResolver(schema)(values, context, options)
    },
    defaultValues: {
      jobName: "",
      source: "",
      projectId: "",
      issueTypeIds: [],
      issueIds: [],
    },
  })

  const scheduleJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const response = await fetch("/api/scheduler/scheduleNewJob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error("Failed to schedule job")
      return response.json()
    },
    onSuccess: () => {
      setSuccessSource("jira")
      setSuccessDialogOpen(true)
    }
  })

  const scheduleStandaloneJobMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/scheduler/scheduleStandaloneJob', {
        method: 'POST',
        body: formData
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to schedule standalone job')
      }
      const result = await response.json()
      return result
    },
    onSuccess: () => {
      setSuccessSource("standalone")
      setSuccessDialogOpen(true)
    },
    onError: (error) => {
      setErrorMessage(error.message)
      setErrorDialogOpen(true)
    }
  })

  const selectedSource = form.watch("source")

  useEffect(() => {
    if (selectedSource) {
      const currentJobName = form.getValues("jobName")
      form.reset({
        jobName: currentJobName,
        source: selectedSource,
        projectId: "",
        issueTypeIds: [],
        issueIds: [],
      })
    }
  }, [selectedSource, form])

  const onSubmit = (data: JobFormData) => {
    if (data.source === "standalone") {
      const isValid = standaloneValidateRef.current.validate()
      if (!isValid) {
        return
      }
      const requirements = standaloneValidateRef.current.getRequirements()
      
      const formData = new FormData()
      formData.append('jobName', data.jobName)
      formData.append('projectId', data.projectId)
      
      requirements.forEach((req, index) => {
        formData.append(`requirements[${index}][name]`, req.name)
        formData.append(`requirements[${index}][content]`, req.content)
        if (req.file) {
          formData.append(`requirements[${index}][file]`, req.file)
        }
      })
      
      scheduleStandaloneJobMutation.mutate(formData)
      return
    }
    if (data.source === "jira") {
      const currentProject = jiraProjects.find(p => p.id === data.projectId)
      if (!currentProject?.cloudId) return
      const fullData = { ...data, cloudId: currentProject.cloudId }
      scheduleJobMutation.mutate(fullData)
    }
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg p-6">
        <Form {...form}>
        <form onSubmit={(e) => {
          e.preventDefault()
          const values = form.getValues()
          
          // For standalone, bypass form validation and use custom validation
          if (values.source === "standalone") {
            onSubmit(values as JobFormData)
            return
          }
          
          // For jira, use normal form validation
          form.handleSubmit(
            (data) => {
              onSubmit(data)
            },
            () => {
              // Validation failed
            }
          )()
        }} className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {/* Source Field - Start */}
              <FormField
                control={form.control}
                name="source"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-base">Source</FormLabel>
                    <Popover open={sourceOpen} onOpenChange={setSourceOpen}>
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
                            <div className="flex items-center gap-2">
                              {field.value === "jira" && (
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
                                  <path d="M108.023 16H61.805c0 11.52 9.324 20.848 20.847 20.848h8.5v8.226c0 11.52 9.328 20.848 20.848 20.848V19.977A3.98 3.98 0 00108.023 16zm0 0" fill="currentColor" />
                                  <path d="M85.121 39.04H38.902c0 11.519 9.325 20.847 20.844 20.847h8.504v8.226c0 11.52 9.328 20.848 20.848 20.848V43.016a3.983 3.983 0 00-3.977-3.977zm0 0" fill="currentColor" />
                                  <path d="M62.219 62.078H16c0 11.524 9.324 20.848 20.848 20.848h8.5v8.23c0 11.52 9.328 20.844 20.847 20.844V66.059a3.984 3.984 0 00-3.976-3.98zm0 0" fill="currentColor" />
                                </svg>
                              )}
                              {field.value === "standalone" && <FolderIcon className="h-4 w-4" />}
                              <span>{field.value === "jira" ? "Jira Project" : field.value === "standalone" ? "Standalone Project" : "Select source..."}</span>
                            </div>
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandList>
                            <CommandGroup>
                              <CommandItem
                                value="standalone"
                                onSelect={() => {
                                  form.setValue("source", "standalone")
                                  form.clearErrors("source")
                                  setSourceOpen(false)
                                }}
                                className="flex justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <FolderIcon className="h-4 w-4" />
                                  Standalone Project
                                </div>
                                <CheckIcon className={cn("h-4 w-4", field.value === "standalone" ? "opacity-100" : "opacity-0")} />
                              </CommandItem>
                              <CommandItem
                                value="jira"
                                onSelect={() => {
                                  form.setValue("source", "jira")
                                  form.clearErrors("source")
                                  setSourceOpen(false)
                                }}
                                className="flex justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
                                    <path d="M108.023 16H61.805c0 11.52 9.324 20.848 20.847 20.848h8.5v8.226c0 11.52 9.328 20.848 20.848 20.848V19.977A3.98 3.98 0 00108.023 16zm0 0" fill="currentColor" />
                                    <path d="M85.121 39.04H38.902c0 11.519 9.325 20.847 20.844 20.847h8.504v8.226c0 11.52 9.328 20.848 20.848 20.848V43.016a3.983 3.983 0 00-3.977-3.977zm0 0" fill="currentColor" />
                                    <path d="M62.219 62.078H16c0 11.524 9.324 20.848 20.848 20.848h8.5v8.23c0 11.52 9.328 20.844 20.847 20.844V66.059a3.984 3.984 0 00-3.976-3.98zm0 0" fill="currentColor" />
                                  </svg>
                                  Jira Project
                                </div>
                                <CheckIcon className={cn("h-4 w-4", field.value === "jira" ? "opacity-100" : "opacity-0")} />
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Source Field - End */}
            </div>
            {selectedSource === "jira" && <JiraSourceFields form={form as unknown as UseFormReturn<FieldValues>} projects={jiraProjects} />}
            {selectedSource === "standalone" && <StandaloneSourceFields form={form as unknown as UseFormReturn<FieldValues>} projects={standaloneProjects} validateRef={standaloneValidateRef} />}
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
            <Button type="submit" disabled={scheduleJobMutation.isPending || scheduleStandaloneJobMutation.isPending}>
              {(scheduleJobMutation.isPending || scheduleStandaloneJobMutation.isPending) ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
        </Form>

        <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Success!</AlertDialogTitle>
              <AlertDialogDescription>
                Job scheduled successfully.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => {
                setSuccessDialogOpen(false)
                router.push(`/scheduler?tab=${successSource}`)
              }}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
