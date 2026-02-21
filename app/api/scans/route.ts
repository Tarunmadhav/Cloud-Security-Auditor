import { NextResponse } from "next/server"
import {
  getAllScans,
  addScan,
  updateScan,
  addFindings,
  addThreats,
  addCompliance,
} from "@/lib/scan-store"
import { gatherScanData } from "@/lib/scanners"
import { analyzeWithAI } from "@/lib/ai-analyzer"
import type { Scan, ScanScope } from "@/lib/types"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET() {
  return NextResponse.json(getAllScans())
}

export async function POST(request: Request) {
  const body = await request.json()

  const scanScope: ScanScope = body.scanScope || "full"
  const newScan: Scan = {
    id: `scan-${Date.now()}`,
    name: body.name || "Security Scan",
    target: body.target || "",
    scanScope,
    status: "running",
    startTime: new Date().toISOString(),
    endTime: null,
    findingsCount: 0,
    progress: 0,
    criticalCount: 0,
    highCount: 0,
  }

  addScan(newScan)

  // Run the real scan pipeline in the background (non-blocking)
  runScanPipeline(newScan.id, newScan.target, newScan.scanScope)

  return NextResponse.json(newScan, { status: 201 })
}

async function runScanPipeline(scanId: string, target: string, scope: ScanScope) {
  try {
    // Phase 1: Gather real data from public APIs (progress 0-50%)
    updateScan(scanId, { progress: 5 })

    const rawData = await gatherScanData(target, scope)

    updateScan(scanId, { progress: 50 })

    // Phase 2: AI analysis with Groq (progress 50-90%)
    const analysis = await analyzeWithAI(scanId, rawData)

    updateScan(scanId, { progress: 90 })

    // Phase 3: Store results (progress 90-100%)
    addFindings(analysis.vulnerabilities)
    addThreats(analysis.threats)
    addCompliance(analysis.compliance)

    const criticalCount = analysis.vulnerabilities.filter(
      (v) => v.severity === "critical"
    ).length
    const highCount = analysis.vulnerabilities.filter(
      (v) => v.severity === "high"
    ).length

    updateScan(scanId, {
      status: "completed",
      progress: 100,
      endTime: new Date().toISOString(),
      findingsCount: analysis.vulnerabilities.length,
      criticalCount,
      highCount,
    })
  } catch (error) {
    console.error(`Scan ${scanId} failed:`, error)
    updateScan(scanId, {
      status: "failed",
      progress: 0,
      endTime: new Date().toISOString(),
    })
  }
}
