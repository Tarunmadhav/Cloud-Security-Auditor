import { NextResponse } from "next/server"
import { getAllFindings } from "@/lib/scan-store"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const severity = searchParams.get("severity")
  const status = searchParams.get("status")

  let filtered = getAllFindings()

  if (severity) {
    const severities = severity.split(",")
    filtered = filtered.filter((v) => severities.includes(v.severity))
  }

  if (status) {
    filtered = filtered.filter((v) => v.status === status)
  }

  return NextResponse.json(filtered)
}
