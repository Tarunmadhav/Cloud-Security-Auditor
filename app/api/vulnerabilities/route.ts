import { NextResponse } from "next/server"
import { vulnerabilities } from "@/lib/mock-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const severity = searchParams.get("severity")
  const status = searchParams.get("status")
  const provider = searchParams.get("provider")

  await new Promise((r) => setTimeout(r, 100))

  let filtered = [...vulnerabilities]

  if (severity) {
    const severities = severity.split(",")
    filtered = filtered.filter((v) => severities.includes(v.severity))
  }

  if (status) {
    filtered = filtered.filter((v) => v.status === status)
  }

  if (provider) {
    filtered = filtered.filter((v) => v.cloudProvider === provider)
  }

  return NextResponse.json(filtered)
}
