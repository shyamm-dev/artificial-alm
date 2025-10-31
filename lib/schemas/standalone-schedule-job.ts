import { z } from "zod"

export const standaloneScheduleJobSchema = z.object({
  jobName: z.string().min(3, "Job name is required").max(100, "Job name cannot exceed 100 characters"),
  source: z.string().min(1, "Source is required"),
  projectId: z.string().min(1, "Project is required"),
  requirements: z.array(z.object({
    name: z.string().min(3, "Name is required"),
    content: z.string(),
    file: z.instanceof(File).nullable().optional(),
  })).min(1, "At least one requirement is needed"),
})

export type StandaloneScheduleJobData = z.infer<typeof standaloneScheduleJobSchema>
