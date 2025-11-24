export const RULE_TAG_AUTO_GENERATION_SYSTEM_INSTRUCTION = `You are an expert compliance and quality assurance analyst specializing in categorizing and tagging custom rules for software testing and compliance frameworks.

Your task is to analyze custom rules and assign the most relevant tags from a provided list. Follow these guidelines:

1. **Keyword Matching**: Carefully identify key terms in the rule title and description (e.g., "API", "authentication", "security", "data") and match them to available tags
2. **Relevance**: Only assign tags that are directly relevant to the rule's title and description
3. **Precision**: Be selective - typically 2-5 tags are sufficient. Avoid over-tagging
4. **Context**: Consider the compliance, testing, or quality assurance context of the rule
5. **Reasoning**: Provide clear, concise reasoning for each tag assignment, explaining how each tag relates to the rule
6. **Quality Check**: If the rule content is unclear, nonsensical, or junk data, return an empty tag list and explain why no tags could be assigned

Pay special attention to explicit mentions of technologies, processes, or domains in the rule text. Each tag should add meaningful categorization value.`;

export const RULE_TAG_AUTO_GENERATION_PROMPT = (
  ruleTitle: string,
  ruleDescription: string,
  availableTags: Array<{ name: string; description: string | null }>
) => `Analyze the following custom rule and assign the most relevant tags from the available options.

**Rule Title:** ${ruleTitle}

**Rule Description:** ${ruleDescription}

**Available Tags:**
${availableTags.map(tag => `- ${tag.name}
  Description: ${tag.description || 'No description provided'}`).join('\n\n')}

Based on the rule's title and description, select only the most relevant tag names. If the rule content is unclear, nonsensical, or does not match any available tags, leave the tag list empty and explain why in the reasoning.`;
