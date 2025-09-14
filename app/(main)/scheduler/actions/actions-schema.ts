import { z } from "zod"

export const jiraIssueSearchActionSchema = z.object({
  cloudId: z.string().min(1, "cloudId is required"),
  projectId: z.string().min(1, "projectId is required"),
  filters: z.object({
    text: z.string().optional(),
    issueType: z.array(z.string()).optional(),
    assignee: z.string().optional(),
  }).optional()
});

export type JiraIssueSearchActionArgs = z.infer<typeof jiraIssueSearchActionSchema>;
