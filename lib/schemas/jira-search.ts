import { z } from "zod"

export const jiraIssueSearchSchema = z.object({
  cloudId: z.string().min(1, "cloudId is required"),
  projectId: z.string().min(1, "projectId is required"),
  filters: z.object({
    text: z.string().optional(),
    issueType: z.array(z.string()).optional()
  }).optional()
})

export type JiraIssueSearchParams = z.infer<typeof jiraIssueSearchSchema>