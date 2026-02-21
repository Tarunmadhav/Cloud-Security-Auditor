import { NextResponse } from "next/server"
import {
  getScanById,
  getFindingsByScanId,
  getThreatsByScanId,
  getComplianceByScanId,
} from "@/lib/scan-store"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const scan = getScanById(id)
  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 })
  }

  const findings = getFindingsByScanId(id)
  const threats = getThreatsByScanId(id)
  const compliance = getComplianceByScanId(id)

  return NextResponse.json({ ...scan, findings, threats, compliance })
}
