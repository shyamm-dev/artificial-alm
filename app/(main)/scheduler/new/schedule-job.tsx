"use client"

import { useForm, type UseFormReturn, type FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, use, useRef, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { getUserAccessibleProjects } from "@/db/queries/user-project-queries"
import { getStandaloneProjects } from "@/db/queries/standalone-project-queries"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { FolderIcon } from "lucide-react"
import {
  Form,
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
  const [workspace, setWorkspace] = useState<"standalone" | "jira" | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [, setSuccessSource] = useState<"jira" | "standalone">("jira")
  const standaloneValidateRef = useRef<{ validate: () => boolean; getRequirements: () => Array<{ id: string; name: string; content: string; file: File | null }> }>({
    validate: () => true,
    getRequirements: () => []
  })


  useEffect(() => {
    const savedSource = localStorage.getItem('selectedSource') as "standalone" | "jira" | null
    setWorkspace(savedSource)

    const handleStorageChange = () => {
      const newSource = localStorage.getItem('selectedSource') as "standalone" | "jira" | null
      setWorkspace(newSource)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('workspace-changed', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('workspace-changed', handleStorageChange)
    }
  }, [])

  const form = useForm<JobFormData>({
    resolver: async (values, context, options) => {
      const schema = workspace === "standalone" ? standaloneScheduleJobSchema : scheduleJobFormSchema
      return zodResolver(schema)(values, context, options)
    },
    defaultValues: {
      jobName: "",
      source: workspace || "",
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

  useEffect(() => {
    if (workspace) {
      form.reset({
        jobName: "",
        source: workspace,
        projectId: "",
        issueTypeIds: [],
        issueIds: [],
      })
    }
  }, [workspace, form])

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

  const getDescription = () => {
    if (workspace === "standalone") {
      return "Add requirements manually or upload files to generate test cases"
    }
    if (workspace === "jira") {
      return "Select Jira issues from your project to generate test cases automatically"
    }
    return "Pick requirements from your project to create test cases automatically"
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-4">
          <FolderIcon className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">No Workspace Selected</h3>
            <p className="text-sm text-muted-foreground">Select a workspace from the header to create a job</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="mb-4">
        <h1 className="text-xl font-bold">New Test Case Generation</h1>
        <p className="text-muted-foreground">{getDescription()}</p>
      </div>
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
            {workspace === "jira" && <JiraSourceFields form={form as unknown as UseFormReturn<FieldValues>} projects={jiraProjects} />}
            {workspace === "standalone" && <StandaloneSourceFields form={form as unknown as UseFormReturn<FieldValues>} projects={standaloneProjects} validateRef={standaloneValidateRef} />}
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
                router.push('/scheduler')
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
