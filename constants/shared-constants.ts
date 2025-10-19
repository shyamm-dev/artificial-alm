export const COMPLIANCE_FRAMEWORKS = [
  "FDA",
  "IEC 62304",
  "ISO 9001",
  "ISO 13485",
  "ISO 27001"
] as const;

export const SCHEDULED_JOB_ISSUE_STATUS = [
  "pending",
  "in_progress",
  "completed",
  "failed",
  "deployed_to_jira"
] as const;

export const TEST_CASE_GENERATED_BY = [
  "ai",
  "manual"
] as const;

export type ComplianceFramework = typeof COMPLIANCE_FRAMEWORKS[number];
export type ScheduledJobIssueStatus = typeof SCHEDULED_JOB_ISSUE_STATUS[number];
export type TestCaseGeneratedBy = typeof TEST_CASE_GENERATED_BY[number];
