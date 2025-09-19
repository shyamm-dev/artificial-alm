export const COMPLIANCE_FRAMEWORKS = [
  "SOC2",
  "HIPAA",
  "ISO27001",
  "GDPR",
  "PCI-DSS",
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
