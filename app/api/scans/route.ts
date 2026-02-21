import { NextResponse } from "next/server"
import { scans } from "@/lib/mock-data"

export async function GET() {
  await new Promise((r) => setTimeout(r, 100))
  return NextResponse.json(scans)
}

export async function POST(request: Request) {
  const body = await request.json()
  await new Promise((r) => setTimeout(r, 200))

  const newScan = {
    id: `scan-${Date.now()}`,
    name: body.name || "New Security Scan",
    target: body.target || "aws://default-account",
    cloudProvider: body.cloudProvider || "AWS",
    status: "running" as const,
    scanType: body.scanType || "Full Audit",
    startTime: new Date().toISOString(),
    endTime: null,
    findingsCount: 0,
    progress: 0,
    criticalCount: 0,
    highCount: 0,
  }

  return NextResponse.json(newScan, { status: 201 })
}
