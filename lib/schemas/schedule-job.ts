import { z } from "zod"

export const scheduleJobFormSchema = z.object({
  jobName: z.string().min(3, "Job name is required").max(100, "Job name cannot exceed 100 characters"),
  source: z.string().min(1, "Source is required"),
  projectId: z.string().min(1, "Project is required"),
  issueTypeIds: z.array(z.string()).optional(),
  issueIds: z.array(z.string()).min(1, "At least one requirement is needed for testcase generation"),
})

export const scheduleJobSchema = scheduleJobFormSchema.extend({
  cloudId: z.string().min(1, "Cloud ID is required"),
})

export type ScheduleJobData = z.infer<typeof scheduleJobSchema>
export type ScheduleJobFormData = z.infer<typeof scheduleJobFormSchema>
