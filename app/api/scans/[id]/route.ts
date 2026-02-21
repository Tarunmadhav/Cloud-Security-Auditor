import { NextResponse } from "next/server"
import { scans, vulnerabilities } from "@/lib/mock-data"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await new Promise((r) => setTimeout(r, 100))

  const scan = scans.find((s) => s.id === id)
  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 })
  }

  const findings = vulnerabilities.filter((v) => v.scanId === id)

  return NextResponse.json({ ...scan, findings })
}
