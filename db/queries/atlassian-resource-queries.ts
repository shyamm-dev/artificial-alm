import { atlassianResource } from "../schema/atlassian-resource-schema";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

// SELECT | INSERT | UPDATE jiraProject
export const atlassianResourceInsertSchema = createInsertSchema(atlassianResource);
export const atlassianResourceSelectSchema = createSelectSchema(atlassianResource);
export const atlassianResourceUpdateSchema = createUpdateSchema(atlassianResource);
