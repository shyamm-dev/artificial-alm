interface JiraFilters {
  text?: string
  issueType?: string[]
  assignee?: string
}

function escapeJQLString(value: string): string {
  return value.trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function isPotentialIssueKey(value: string): boolean {
  // Detects keys like "ABC-123" (case-insensitive)
  return /^[A-Z][A-Z0-9_]+-\d+$/i.test(value.trim())
}

export function buildJQL(projectId: string, filters?: JiraFilters): string {
  let jql = `project = ${projectId}`

  if (filters?.assignee) {
    const assignee = escapeJQLString(filters.assignee)
    if (assignee) jql += ` AND assignee = "${assignee}"`
  }

  if (filters?.issueType?.length) {
    const types = filters.issueType
      .map((t) => `"${escapeJQLString(t)}"`)
      .join(",")
    if (types.length) jql += ` AND issuetype IN (${types})`
  }

  if (filters?.text) {
    const text = escapeJQLString(filters.text)
    if (text) {
      if (isPotentialIssueKey(text)) {
        jql += ` AND (key = ${text.toUpperCase()} OR text ~ "${text}")`
      } else {
        jql += ` AND text ~ "${text}"`
      }
    }
  }

  return jql
}
