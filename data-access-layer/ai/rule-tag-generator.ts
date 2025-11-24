import { aiClient } from "./ai-client";
import { RULE_TAG_AUTO_GENERATION_SYSTEM_INSTRUCTION, RULE_TAG_AUTO_GENERATION_PROMPT } from "@/constants/ai-prompts";
import { ruleTagAutoGenerationJsonSchema, type RuleTagAutoGeneration } from "@/lib/schemas/ai-schemas";

interface GenerateRuleTagsParams {
  ruleTitle: string;
  ruleDescription: string;
  availableTags: Array<{ name: string; description: string | null }>;
}

export async function generateRuleTags(params: GenerateRuleTagsParams) {
  const prompt = RULE_TAG_AUTO_GENERATION_PROMPT(
    params.ruleTitle,
    params.ruleDescription,
    params.availableTags
  );

  const result = await aiClient.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: { parts: [{ text: RULE_TAG_AUTO_GENERATION_SYSTEM_INSTRUCTION }] },
      responseSchema: ruleTagAutoGenerationJsonSchema as never,
      temperature: 0.7,
    },
    model: "gemini-2.5-flash",
  });

  if (result.error) throw result.error;
  if (!result.data) throw new Error("No response from AI");

  const responseText = result.data.text || JSON.stringify(result.data);
  const parsed: RuleTagAutoGeneration = JSON.parse(responseText);
  return parsed;
}
