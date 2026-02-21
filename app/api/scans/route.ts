import { NextResponse } from "next/server"
import { getAllScans, addScan, updateScan, addFinding, getFindingsByScanId } from "@/lib/scan-store"
import type { Scan, Vulnerability, Severity, VulnStatus, CloudProvider } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(getAllScans())
}

export async function POST(request: Request) {
  const body = await request.json()

  const newScan: Scan = {
    id: `scan-${Date.now()}`,
    name: body.name || "New Security Scan",
    target: body.target || "aws://default-account",
    cloudProvider: body.cloudProvider || "AWS",
    status: "running",
    scanType: body.scanType || "Full Audit",
    startTime: new Date().toISOString(),
    endTime: null,
    findingsCount: 0,
    progress: 0,
    criticalCount: 0,
    highCount: 0,
  }

  addScan(newScan)

  // Simulate scan progress in the background
  simulateScanProgress(newScan.id, newScan.cloudProvider)

  return NextResponse.json(newScan, { status: 201 })
}

function simulateScanProgress(scanId: string, cloudProvider: CloudProvider) {
  let progress = 0

  const findingTemplates: Array<{
    title: string
    severity: Severity
    category: string
    cvssScore: number
    resource: string
    description: string
    remediation: string
    providers: CloudProvider[]
  }> = [
    {
      title: "Publicly Accessible Storage Bucket",
      severity: "critical",
      category: "Storage Misconfiguration",
      cvssScore: 9.8,
      resource: "storage://public-data-bucket",
      description: "A storage bucket is publicly accessible, exposing potentially sensitive data to the internet.",
      remediation: "Disable public access and apply bucket policies restricting access to authorized principals only.",
      providers: ["AWS", "GCP", "Azure"],
    },
    {
      title: "Root Account Without MFA",
      severity: "critical",
      category: "IAM Misconfiguration",
      cvssScore: 9.6,
      resource: "iam://root-account",
      description: "The root/owner account does not have multi-factor authentication enabled.",
      remediation: "Enable MFA on the root account immediately. Use a dedicated admin account for daily tasks.",
      providers: ["AWS", "GCP", "Azure"],
    },
    {
      title: "Unencrypted Database Instance",
      severity: "high",
      category: "Data Protection",
      cvssScore: 7.9,
      resource: "db://prod-database-01",
      description: "Database instance does not have encryption at rest enabled. Data is stored in plaintext on disk.",
      remediation: "Enable encryption at rest. For existing instances, create an encrypted snapshot and restore.",
      providers: ["AWS", "GCP", "Azure"],
    },
    {
      title: "Overprivileged Service Account",
      severity: "high",
      category: "IAM Misconfiguration",
      cvssScore: 8.2,
      resource: "iam://service-account-analytics",
      description: "Service account has admin-level permissions, violating the principle of least privilege.",
      remediation: "Replace broad permissions with fine-grained roles specific to the workload.",
      providers: ["AWS", "GCP", "Azure"],
    },
    {
      title: "Security Group Allows Unrestricted SSH",
      severity: "high",
      category: "Network Security",
      cvssScore: 7.5,
      resource: "sg://prod-web-servers",
      description: "Security group allows inbound SSH (port 22) from any IP (0.0.0.0/0).",
      remediation: "Restrict SSH access to known IP ranges or use a bastion host.",
      providers: ["AWS", "Azure"],
    },
    {
      title: "Logging Not Enabled",
      severity: "medium",
      category: "Monitoring",
      cvssScore: 5.3,
      resource: "logging://cloud-trail",
      description: "Cloud activity logging is not enabled in all regions, reducing audit visibility.",
      remediation: "Enable activity logging across all regions and forward logs to a centralized SIEM.",
      providers: ["AWS", "GCP", "Azure"],
    },
    {
      title: "Outdated SSL/TLS Certificate",
      severity: "medium",
      category: "Data Protection",
      cvssScore: 5.9,
      resource: "cert://api-gateway-cert",
      description: "An SSL/TLS certificate is using an outdated protocol version (TLS 1.0/1.1).",
      remediation: "Update to TLS 1.2 or 1.3 and rotate the certificate.",
      providers: ["AWS", "GCP", "Azure"],
    },
    {
      title: "Unused Access Keys Detected",
      severity: "medium",
      category: "IAM Misconfiguration",
      cvssScore: 6.1,
      resource: "iam://access-key-legacy",
      description: "Access keys that have not been used in over 90 days were detected.",
      remediation: "Rotate or deactivate unused access keys. Set up automated key rotation policies.",
      providers: ["AWS", "GCP", "Azure"],
    },
    {
      title: "Default VPC In Use",
      severity: "low",
      category: "Network Security",
      cvssScore: 3.2,
      resource: "vpc://default",
      description: "Resources are deployed in the default VPC which has less restrictive default settings.",
      remediation: "Create custom VPCs with proper network segmentation for production workloads.",
      providers: ["AWS", "Azure"],
    },
    {
      title: "Resource Tagging Non-Compliant",
      severity: "info",
      category: "Best Practices",
      cvssScore: 1.0,
      resource: "tags://untagged-resources",
      description: "Multiple resources are missing required tags for cost allocation and ownership tracking.",
      remediation: "Apply mandatory tags (Environment, Owner, CostCenter) to all resources.",
      providers: ["AWS", "GCP", "Azure"],
    },
  ]

  // Shuffle and pick a random subset of templates for this scan
  const shuffled = [...findingTemplates]
    .filter((t) => t.providers.includes(cloudProvider))
    .sort(() => Math.random() - 0.5)
  const totalFindings = Math.min(shuffled.length, Math.floor(Math.random() * 5) + 4)
  const selectedTemplates = shuffled.slice(0, totalFindings)
  let findingsAdded = 0

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5

    // Add findings as progress advances
    const targetFindings = Math.floor((Math.min(progress, 100) / 100) * totalFindings)
    while (findingsAdded < targetFindings && findingsAdded < selectedTemplates.length) {
      const template = selectedTemplates[findingsAdded]
      const statuses: VulnStatus[] = ["open", "open", "open", "in_progress"]
      const finding: Vulnerability = {
        id: `vuln-${scanId}-${findingsAdded + 1}`,
        title: template.title,
        severity: template.severity,
        category: template.category,
        cvssScore: template.cvssScore,
        affectedResource: template.resource,
        cloudProvider: cloudProvider,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        description: template.description,
        remediation: template.remediation,
        scanId: scanId,
        discoveredAt: new Date().toISOString(),
      }
      addFinding(finding)
      findingsAdded++
    }

    const currentFindings = getFindingsByScanId(scanId)
    const criticalCount = currentFindings.filter((f) => f.severity === "critical").length
    const highCount = currentFindings.filter((f) => f.severity === "high").length

    if (progress >= 100) {
      progress = 100
      clearInterval(interval)
      updateScan(scanId, {
        status: "completed",
        progress: 100,
        endTime: new Date().toISOString(),
        findingsCount: currentFindings.length,
        criticalCount,
        highCount,
      })
    } else {
      updateScan(scanId, {
        progress,
        findingsCount: currentFindings.length,
        criticalCount,
        highCount,
      })
    }
  }, 3000)
}
