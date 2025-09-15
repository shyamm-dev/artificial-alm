import { z } from "zod"

export const scheduleJobSchema = z.object({
  jobName: z.string().min(3, "Job name is required"),
  projectId: z.string().min(1, "Project is required"),
  cloudId: z.string().min(1, "Cloud ID is required"),
  issueTypeIds: z.array(z.string()).optional(),
  issueIds: z.array(z.string()).min(1, "At least one requirement is needed for testcase generation"),
})

export type ScheduleJobData = z.infer<typeof scheduleJobSchema>