import { NextResponse } from "next/server"
import { threats } from "@/lib/mock-data"

export async function GET() {
  await new Promise((r) => setTimeout(r, 100))
  return NextResponse.json(threats)
}
