import { NextResponse } from "next/server"
import { complianceFrameworks } from "@/lib/mock-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const framework = searchParams.get("framework")

  await new Promise((r) => setTimeout(r, 100))

  if (framework) {
    const found = complianceFrameworks.find(
      (f) => f.shortName.toLowerCase() === framework.toLowerCase()
    )
    if (!found) {
      return NextResponse.json({ error: "Framework not found" }, { status: 404 })
    }
    return NextResponse.json(found)
  }

  return NextResponse.json(complianceFrameworks)
}
