import { jiraProject, jiraProjectIssueType } from '../schema/jira-project-schema';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

// SELECT | INSERT | UPDATE jiraProject
export const jiraProjectInsertSchema = createInsertSchema(jiraProject);
export const jiraProjectSelectSchema = createSelectSchema(jiraProject);
export const jiraProjectUpdateSchema = createUpdateSchema(jiraProject);

// SELECT | INSERT | UPDATE jiraProjectIssueType
export const jiraProjectIssueTypeInsertSchema = createInsertSchema(jiraProjectIssueType);
export const jiraProjectIssueTypeSelectSchema = createSelectSchema(jiraProjectIssueType);
export const jiraProjectIssueTypeUpdateSchema = createUpdateSchema(jiraProjectIssueType);
