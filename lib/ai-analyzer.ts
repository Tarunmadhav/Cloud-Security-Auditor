import { generateObject } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { z } from "zod"
import type {
  Vulnerability,
  Threat,
  ComplianceFramework,
  ScanRawData,
} from "./types"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const vulnerabilitySchema = z.object({
  title: z.string(),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  category: z.string(),
  cvssScore: z.number().min(0).max(10),
  affectedResource: z.string(),
  status: z.enum(["open", "remediated", "accepted", "in_progress"]),
  description: z.string(),
  remediation: z.string(),
})

const threatSchema = z.object({
  type: z.string(),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  source: z.string(),
  description: z.string(),
  status: z.enum(["active", "investigating", "resolved"]),
  relatedFindings: z.number(),
  recommendedAction: z.string(),
})

const complianceControlSchema = z.object({
  controlId: z.string(),
  description: z.string(),
  status: z.enum(["pass", "fail", "na"]),
  category: z.string(),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
})

const complianceFrameworkSchema = z.object({
  name: z.string(),
  shortName: z.string(),
  controls: z.array(complianceControlSchema),
})

const analysisSchema = z.object({
  vulnerabilities: z.array(vulnerabilitySchema),
  threats: z.array(threatSchema),
  complianceFrameworks: z.array(complianceFrameworkSchema),
})

function formatScanDataForPrompt(rawData: ScanRawData): string {
  const sections: string[] = []

  sections.push(`## Target: ${rawData.targetUrl}`)
  if (rawData.resolvedIP) {
    sections.push(`## Resolved IP: ${rawData.resolvedIP}`)
  }

  if (rawData.headers) {
    sections.push(`\n## HTTP Security Headers`)
    const presentHeaders: string[] = []
    const missingHeaders: string[] = []
    for (const [key, value] of Object.entries(rawData.headers)) {
      if (key.startsWith("_missing_")) {
        missingHeaders.push(key.replace("_missing_", ""))
      } else {
        presentHeaders.push(`  ${key}: ${value}`)
      }
    }
    if (presentHeaders.length) sections.push(`Present:\n${presentHeaders.join("\n")}`)
    if (missingHeaders.length) sections.push(`Missing (NOT present):\n${missingHeaders.map((h) => `  - ${h}`).join("\n")}`)
  }

  if (rawData.shodan) {
    sections.push(`\n## Shodan InternetDB Results`)
    sections.push(`  Open Ports: ${rawData.shodan.ports.join(", ") || "none"}`)
    sections.push(`  Known CVEs: ${rawData.shodan.vulns.join(", ") || "none"}`)
    sections.push(`  CPEs (software): ${rawData.shodan.cpes.join(", ") || "none"}`)
    sections.push(`  Tags: ${rawData.shodan.tags.join(", ") || "none"}`)
    sections.push(`  Hostnames: ${rawData.shodan.hostnames.join(", ") || "none"}`)
  }

  if (rawData.dns) {
    sections.push(`\n## DNS Security Records`)
    sections.push(`  SPF record present: ${rawData.dns.hasSPF}`)
    sections.push(`  DKIM record present: ${rawData.dns.hasDKIM}`)
    sections.push(`  DMARC record present: ${rawData.dns.hasDMARC}`)
    if (rawData.dns.records.length) {
      sections.push(`  Records:`)
      for (const r of rawData.dns.records) {
        sections.push(`    ${r.type}: ${r.value}`)
      }
    }
  }

  if (rawData.ssl) {
    sections.push(`\n## SSL/TLS Information`)
    sections.push(`  Status: ${rawData.ssl.grade}`)
    sections.push(`  HSTS Enabled: ${rawData.ssl.supportsHSTS}`)
    if (rawData.ssl.vulnerabilities.length) {
      sections.push(`  Issues: ${rawData.ssl.vulnerabilities.join(", ")}`)
    }
  }

  if (rawData.technologies.length) {
    sections.push(`\n## Detected Technologies`)
    sections.push(`  ${rawData.technologies.join(", ")}`)
  }

  return sections.join("\n")
}

export async function analyzeWithAI(
  scanId: string,
  rawData: ScanRawData
): Promise<{
  vulnerabilities: Vulnerability[]
  threats: Threat[]
  compliance: ComplianceFramework[]
}> {
  const scanDataText = formatScanDataForPrompt(rawData)

  const { object } = await generateObject({
    model: groq("llama-3.3-70b-versatile"),
    schema: analysisSchema,
    prompt: `You are an expert cloud and web security auditor. Analyze the following REAL scan data gathered from a live target and produce security findings.

IMPORTANT RULES:
- ONLY report findings that are directly supported by the scan data below. Do NOT invent or hallucinate findings.
- Every vulnerability must reference a specific piece of evidence from the scan data.
- CVSS scores must be accurate and follow CVSS v3.1 scoring guidelines.
- For compliance, evaluate against OWASP Top 10, CIS Benchmarks for web servers, and NIST CSF.
- All statuses for vulnerabilities should be "open" since these are newly discovered.
- For threats, assess realistic threat scenarios based on the exposed attack surface.
- If a section has no findings (e.g., no ports exposed), return an empty array for that section — do NOT fabricate data.

SCAN DATA:
${scanDataText}

Produce a comprehensive security analysis with:
1. **Vulnerabilities**: Each finding must cite specific evidence (e.g., "Missing Content-Security-Policy header", "Port 22 (SSH) open", "CVE-2024-XXXX found via Shodan"). Include clear remediation steps.
2. **Threats**: Realistic threat scenarios based on the discovered attack surface. Reference specific findings.
3. **Compliance Frameworks**: Evaluate against:
   - OWASP Top 10 (relevant web security controls)
   - CIS Benchmarks (server/web hardening checks)
   - NIST CSF (identify, protect, detect, respond, recover categories)
   For each framework, evaluate 8-15 relevant controls based on the actual scan data. Mark controls as "pass", "fail", or "na" based on evidence.`,
  })

  // Transform AI output into our typed structures
  const now = new Date().toISOString()

  const vulnerabilities: Vulnerability[] = object.vulnerabilities.map((v, i) => ({
    id: `vuln-${scanId}-${i + 1}`,
    title: v.title,
    severity: v.severity,
    category: v.category,
    cvssScore: v.cvssScore,
    affectedResource: v.affectedResource,
    status: v.status,
    description: v.description,
    remediation: v.remediation,
    scanId,
    discoveredAt: now,
  }))

  const threats: Threat[] = object.threats.map((t, i) => ({
    id: `thr-${scanId}-${i + 1}`,
    type: t.type,
    severity: t.severity,
    source: t.source,
    description: t.description,
    timestamp: now,
    status: t.status,
    relatedFindings: t.relatedFindings,
    recommendedAction: t.recommendedAction,
    scanId,
  }))

  const compliance: ComplianceFramework[] = object.complianceFrameworks.map((fw) => {
    const controls = fw.controls.map((c, i) => ({
      id: `${fw.shortName.toLowerCase()}-${scanId}-${i + 1}`,
      controlId: c.controlId,
      description: c.description,
      status: c.status,
      category: c.category,
      severity: c.severity,
      framework: fw.shortName,
    }))

    const passed = controls.filter((c) => c.status === "pass").length
    const failed = controls.filter((c) => c.status === "fail").length
    const na = controls.filter((c) => c.status === "na").length
    const total = controls.length
    const score = total - na > 0 ? Math.round((passed / (total - na)) * 100) : 0

    return {
      name: fw.name,
      shortName: fw.shortName,
      score,
      totalControls: total,
      passedControls: passed,
      failedControls: failed,
      naControls: na,
      controls,
      scanId,
    }
  })

  return { vulnerabilities, threats, compliance }
}
