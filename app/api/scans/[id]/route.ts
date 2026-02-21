import { NextResponse } from "next/server"
import { getScanById } from "@/lib/scan-store"
import { vulnerabilities } from "@/lib/mock-data"

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

  const findings = vulnerabilities.filter((v) => v.scanId === id)

  return NextResponse.json({ ...scan, findings })
}
