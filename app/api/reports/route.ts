import { NextResponse } from "next/server"
import { generatedReports } from "@/lib/mock-data"

export async function GET() {
  await new Promise((r) => setTimeout(r, 100))
  return NextResponse.json(generatedReports)
}

export async function POST(request: Request) {
  const body = await request.json()
  await new Promise((r) => setTimeout(r, 300))

  const report = {
    id: `gen-${Date.now()}`,
    name: `${body.name || "Report"} - ${new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
    type: body.type || "executive",
    generatedAt: new Date().toISOString(),
    size: `${(Math.random() * 8 + 1).toFixed(1)} MB`,
    status: "ready" as const,
  }

  return NextResponse.json(report, { status: 201 })
}
