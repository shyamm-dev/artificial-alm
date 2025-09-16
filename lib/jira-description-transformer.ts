import type { JiraIssueDescriptionNode } from "@/data-access-layer/types";

export function transformJiraDescriptionToText(nodes: JiraIssueDescriptionNode[]): string {
  return nodes
    .map(node => {
      if (node.type === "text" && node.text) {
        return node.text;
      }
      if (node.content) {
        return transformJiraDescriptionToText(node.content);
      }
      return "";
    })
    .filter(text => text.trim())
    .join(" ");
}