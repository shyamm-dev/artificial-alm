export const COMPLIANCE_FRAMEWORKS = [
  "SOC2",
  "HIPAA",
  "ISO27001",
  "GDPR",
  "PCI-DSS",
] as const;


export type ComplianceFramework = typeof COMPLIANCE_FRAMEWORKS[number];
