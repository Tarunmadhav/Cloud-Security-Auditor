export type CloudProvider = "AWS" | "Azure" | "GCP"
export type Severity = "critical" | "high" | "medium" | "low" | "info"
export type ScanStatus = "completed" | "running" | "pending" | "failed"
export type VulnStatus = "open" | "remediated" | "accepted" | "in_progress"
export type ThreatStatus = "active" | "investigating" | "resolved"
export type ComplianceStatus = "pass" | "fail" | "na"

export interface Scan {
  id: string
  name: string
  target: string
  cloudProvider: CloudProvider
  status: ScanStatus
  scanType: string
  startTime: string
  endTime: string | null
  findingsCount: number
  progress: number
  criticalCount: number
  highCount: number
}

export interface Vulnerability {
  id: string
  title: string
  severity: Severity
  category: string
  cvssScore: number
  affectedResource: string
  cloudProvider: CloudProvider
  status: VulnStatus
  description: string
  remediation: string
  scanId: string
  discoveredAt: string
}

export interface ComplianceControl {
  id: string
  controlId: string
  description: string
  status: ComplianceStatus
  category: string
  severity: Severity
  framework: string
}

export interface ComplianceFramework {
  name: string
  shortName: string
  score: number
  totalControls: number
  passedControls: number
  failedControls: number
  naControls: number
  controls: ComplianceControl[]
}

export interface Threat {
  id: string
  type: string
  severity: Severity
  source: string
  description: string
  timestamp: string
  status: ThreatStatus
  relatedFindings: number
  recommendedAction: string
}

export interface DashboardStats {
  totalScans: number
  activeScans: number
  criticalVulns: number
  complianceScore: number
  threatsDetected: number
  assetsMonitored: number
  totalScansChange: number
  activeScanChange: number
  criticalVulnsChange: number
  complianceChange: number
  threatsChange: number
  assetsChange: number
}

export interface TrendPoint {
  date: string
  critical: number
  high: number
  medium: number
  low: number
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: "executive" | "technical" | "compliance" | "full"
  lastGenerated: string | null
}

export interface GeneratedReport {
  id: string
  name: string
  type: string
  generatedAt: string
  size: string
  status: "ready" | "generating"
}
