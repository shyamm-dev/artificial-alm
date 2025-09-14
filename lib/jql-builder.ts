interface JiraFilters {
  text?: string;
  issueType?: string[];
  assignee?: string;
}

export function buildJQL(projectId: string, filters?: JiraFilters): string {
  let jql = `project = ${projectId}`;

  if (filters?.assignee)
    jql += ` AND assignee = ${filters.assignee}`;

  if (filters?.issueType?.length)
    jql += ` AND issuetype IN (${filters.issueType.join(',')})`;

  if (filters?.text)
    jql += ` AND text ~ "${filters.text}"`;

  return jql;
}
