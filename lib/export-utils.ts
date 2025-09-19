interface TestCase {
  id: string
  issueId: string
  summary: string
  description: string
  generatedBy: 'ai' | 'manual'
  modifiedByUserId: string | null
  createdAt: string
  updatedAt: string
}

interface IssueData {
  jobName?: string
  projectName?: string
  issueKey?: string
  summary?: string
}

export function exportTestCasesToMarkdown(
  testCases: TestCase[],
  initialTestCases: TestCase[],
  issue: IssueData | null
) {
  const markdownContent = `# Test Cases Export

**Job:** ${issue?.jobName}  
**Project:** ${issue?.projectName}  
**Requirement:** ${issue?.issueKey} - ${issue?.summary}  
**Exported:** ${new Date().toISOString()}  

---

${testCases.map((tc, index) => {
  const type = tc.generatedBy === 'ai' ? 'AI Generated' : 'Manual'
  return `## Test Case ${index + 1} ${type}

**Summary:** ${tc.summary}

**Description:**
\`\`\`
${tc.description}
\`\`\`

**Created:** ${tc.createdAt}  
**Updated:** ${tc.updatedAt}

---`
}).join('\n\n')}
    `
    
  const blob = new Blob([markdownContent], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test-cases-${issue?.issueKey || 'export'}-${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportTestCasesToPlainText(
  testCases: TestCase[],
  initialTestCases: TestCase[],
  issue: IssueData | null
) {
  const textContent = `TEST CASES EXPORT

Job: ${issue?.jobName}
Project: ${issue?.projectName}
Requirement: ${issue?.issueKey} - ${issue?.summary}
Exported: ${new Date().toISOString()}

${'='.repeat(80)}

${testCases.map((tc, index) => {
  const type = tc.generatedBy === 'ai' ? 'AI Generated' : 'Manual'
  return `TEST CASE ${index + 1} (${type})

Summary: ${tc.summary}

Description:
${tc.description}

Created: ${tc.createdAt}
Updated: ${tc.updatedAt}

${'-'.repeat(80)}`
}).join('\n\n')}
    `
    
  const blob = new Blob([textContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test-cases-${issue?.issueKey || 'export'}-${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}