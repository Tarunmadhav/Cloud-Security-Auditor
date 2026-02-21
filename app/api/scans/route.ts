import { NextResponse } from "next/server"
import { getAllScans, addScan, updateScan } from "@/lib/scan-store"
import type { Scan } from "@/lib/types"

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
  simulateScanProgress(newScan.id)

  return NextResponse.json(newScan, { status: 201 })
}

function simulateScanProgress(scanId: string) {
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5
    if (progress >= 100) {
      progress = 100
      clearInterval(interval)
      updateScan(scanId, {
        status: "completed",
        progress: 100,
        endTime: new Date().toISOString(),
        findingsCount: Math.floor(Math.random() * 30) + 5,
        criticalCount: Math.floor(Math.random() * 4),
        highCount: Math.floor(Math.random() * 8),
      })
    } else {
      updateScan(scanId, {
        progress,
        findingsCount: Math.floor((progress / 100) * (Math.random() * 20 + 5)),
      })
    }
  }, 3000)
}
