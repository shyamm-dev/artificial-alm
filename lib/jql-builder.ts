interface JiraFilters {
  text?: string
  issueType?: string[]
  assignee?: string
}

function escapeJQLString(value: string): string {
  return value.trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"')
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
        jql += ` AND (key = "${text}" OR text ~ "${text}")`
    }
  }

  return jql
}
