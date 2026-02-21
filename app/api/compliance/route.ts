import { NextResponse } from "next/server"
import { getAllCompliance } from "@/lib/scan-store"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const framework = searchParams.get("framework")

  const all = getAllCompliance()

  if (framework) {
    const found = all.find(
      (f) => f.shortName.toLowerCase() === framework.toLowerCase()
    )
    if (!found) {
      return NextResponse.json({ error: "Framework not found" }, { status: 404 })
    }
    return NextResponse.json(found)
  }

  // Aggregate frameworks with the same shortName across scans
  const aggregated = new Map<string, typeof all[0]>()
  for (const fw of all) {
    const existing = aggregated.get(fw.shortName)
    if (!existing) {
      aggregated.set(fw.shortName, { ...fw })
    } else {
      // Merge controls from multiple scans
      existing.controls = [...existing.controls, ...fw.controls]
      existing.totalControls = existing.controls.length
      existing.passedControls = existing.controls.filter((c) => c.status === "pass").length
      existing.failedControls = existing.controls.filter((c) => c.status === "fail").length
      existing.naControls = existing.controls.filter((c) => c.status === "na").length
      const scorable = existing.totalControls - existing.naControls
      existing.score = scorable > 0 ? Math.round((existing.passedControls / scorable) * 100) : 0
    }
  }

  return NextResponse.json(Array.from(aggregated.values()))
}
