interface BaseTestCase {
  id: string
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

function parseDescription(description: string): string {
  try {
    const parsed = JSON.parse(description)
    
    if (parsed.type === 'functional') {
      return `**Type:** Functional

**Purpose:** ${parsed.purpose || 'NA'}

**Preconditions:** ${parsed.preconditions || 'NA'}

**Testing Procedure:**
${(parsed.testing_procedure || []).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') || 'NA'}

**Expected Result:** ${parsed.expected_result || 'NA'}

**Requirement Coverage:** ${parsed.requirement_coverage || 'NA'}`
    }
    
    if (parsed.type === 'non-functional' || parsed.type === 'non_functional') {
      return `**Type:** Non-Functional

**Test Category:** ${parsed.test_category || 'NA'}

**Preconditions:** ${parsed.preconditions || 'NA'}

**Testing Procedure:**
${(parsed.testing_procedure || []).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') || 'NA'}

**Expected Result:** ${parsed.expected_result || 'NA'}

**Acceptance Criteria:** ${parsed.acceptance_criteria || 'NA'}`
    }
    
    if (parsed.type === 'compliance') {
      return `**Type:** Compliance

**Compliance Rule:** ${parsed.compliance_rule || 'NA'}

**Preconditions:** ${parsed.preconditions || 'NA'}

**Testing Procedure:**
${(parsed.testing_procedure || []).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') || 'NA'}

**Expected Result:** ${parsed.expected_result || 'NA'}

**Compliance Impact:** ${parsed.compliance_impact || 'NA'}`
    }
    
    return description
  } catch {
    return description
  }
}

export function exportTestCasesToMarkdown<T extends BaseTestCase>(
  testCases: T[],
  initialTestCases: T[],
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
  return `## Test Case ${index + 1} (${type})

**Summary:** ${tc.summary}

${parseDescription(tc.description)}

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

export function exportTestCasesToPlainText<T extends BaseTestCase>(
  testCases: T[],
  initialTestCases: T[],
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
  const description = parseDescription(tc.description).replace(/\*\*/g, '').replace(/\n\n/g, '\n')
  return `TEST CASE ${index + 1} (${type})

Summary: ${tc.summary}

${description}

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