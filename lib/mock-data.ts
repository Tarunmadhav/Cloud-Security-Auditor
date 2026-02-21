import type {
  ReportTemplate,
  GeneratedReport,
  ComplianceFramework,
} from "./types"

// --- Compliance Frameworks ---
export const complianceFrameworks: ComplianceFramework[] = [
  {
    name: "CIS Benchmarks",
    shortName: "CIS",
    score: 87,
    totalControls: 142,
    passedControls: 124,
    failedControls: 14,
    naControls: 4,
    controls: [],
    scanId: "scan-001",
  },
  {
    name: "ISO 27001",
    shortName: "ISO",
    score: 74,
    totalControls: 114,
    passedControls: 84,
    failedControls: 26,
    naControls: 4,
    controls: [],
    scanId: "scan-001",
  },
  {
    name: "NIST CSF",
    shortName: "NIST",
    score: 91,
    totalControls: 108,
    passedControls: 98,
    failedControls: 8,
    naControls: 2,
    controls: [],
    scanId: "scan-001",
  },
]

// --- Report Templates ---
export const reportTemplates: ReportTemplate[] = [
  {
    id: "rpt-exec",
    name: "Executive Summary",
    description: "High-level security posture overview with risk scores, key findings, and strategic recommendations for leadership.",
    type: "executive",
    lastGenerated: "2026-02-19T10:00:00Z",
  },
  {
    id: "rpt-tech",
    name: "Technical Breakdown",
    description: "Detailed technical analysis of all discovered vulnerabilities with CVSS scores, attack vectors, and remediation steps.",
    type: "technical",
    lastGenerated: "2026-02-18T14:30:00Z",
  },
  {
    id: "rpt-comp",
    name: "Compliance Report",
    description: "Comprehensive compliance assessment against CIS, ISO 27001, and NIST frameworks with control-by-control analysis.",
    type: "compliance",
    lastGenerated: "2026-02-15T09:00:00Z",
  },
  {
    id: "rpt-full",
    name: "Full Audit Report",
    description: "Complete penetration testing report including methodology, scope, all findings, evidence, and remediation roadmap.",
    type: "full",
    lastGenerated: null,
  },
]

// --- Generated Reports ---
export const generatedReports: GeneratedReport[] = [
  { id: "gen-001", name: "Executive Summary - Feb 2026", type: "executive", generatedAt: "2026-02-19T10:00:00Z", size: "2.4 MB", status: "ready" },
  { id: "gen-002", name: "Technical Breakdown - Feb 2026", type: "technical", generatedAt: "2026-02-18T14:30:00Z", size: "8.1 MB", status: "ready" },
  { id: "gen-003", name: "CIS Compliance - Q1 2026", type: "compliance", generatedAt: "2026-02-15T09:00:00Z", size: "5.6 MB", status: "ready" },
  { id: "gen-004", name: "Executive Summary - Jan 2026", type: "executive", generatedAt: "2026-01-20T10:00:00Z", size: "2.1 MB", status: "ready" },
]
