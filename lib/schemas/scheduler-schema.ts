import { z } from "zod"

export const schedulerJobSchema = z.object({
  jobName: z.string().min(1, "Job name is required"),
  projects: z.array(z.string()).min(1, "At least one project must be selected"),
  issueTypes: z.array(z.string()).optional(),
  issues: z.array(z.string()).min(1, "At least one issue must be selected"),
})

export type SchedulerJobFormData = z.infer<typeof schedulerJobSchema>
