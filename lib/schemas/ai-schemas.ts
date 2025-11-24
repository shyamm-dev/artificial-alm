import * as z from "zod";

export const ruleTagAutoGenerationSchema = z.object({
  selectedTags: z.array(z.string()).describe("Array of tag names that are most relevant to the rule"),
  reasoning: z.string().describe("Clear explanation of why these specific tags were selected and how they relate to the rule"),
});

export type RuleTagAutoGeneration = z.infer<typeof ruleTagAutoGenerationSchema>;

export const ruleTagAutoGenerationJsonSchema = z.toJSONSchema(ruleTagAutoGenerationSchema);
