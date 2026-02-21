import { NextResponse } from "next/server"
import {
  getAllScans,
  getAllFindings,
  getAllThreats,
  getAllCompliance,
} from "@/lib/scan-store"
import type { DashboardStats, TrendPoint } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const scans = getAllScans()
  const findings = getAllFindings()
  const threats = getAllThreats()
  const compliance = getAllCompliance()

  // Compute aggregate compliance score
  const allControls = compliance.flatMap((f) => f.controls)
  const scorableControls = allControls.filter((c) => c.status !== "na")
  const passedControls = allControls.filter((c) => c.status === "pass")
  const complianceScore =
    scorableControls.length > 0
      ? Math.round((passedControls.length / scorableControls.length) * 100)
      : 0

  // Unique targets scanned
  const uniqueTargets = new Set(scans.map((s) => s.target)).size

  const stats: DashboardStats = {
    totalScans: scans.length,
    activeScans: scans.filter((s) => s.status === "running").length,
    criticalVulns: findings.filter((f) => f.severity === "critical").length,
    complianceScore,
    threatsDetected: threats.length,
    assetsMonitored: uniqueTargets,
    // Changes are 0 since we don't track historical data in-memory
    totalScansChange: 0,
    activeScanChange: 0,
    criticalVulnsChange: 0,
    complianceChange: 0,
    threatsChange: 0,
    assetsChange: 0,
  }

  // Build vulnerability trend from scan data (group by date)
  const trendMap = new Map<string, TrendPoint>()
  for (const finding of findings) {
    const date = finding.discoveredAt.slice(0, 10)
    if (!trendMap.has(date)) {
      trendMap.set(date, { date, critical: 0, high: 0, medium: 0, low: 0 })
    }
    const point = trendMap.get(date)!
    if (finding.severity === "critical") point.critical++
    else if (finding.severity === "high") point.high++
    else if (finding.severity === "medium") point.medium++
    else if (finding.severity === "low" || finding.severity === "info") point.low++
  }

  const trend = Array.from(trendMap.values()).sort(
    (a, b) => a.date.localeCompare(b.date)
  )

  return NextResponse.json({ stats, trend })
}
