import { NextResponse } from "next/server"
import { getAllThreats } from "@/lib/scan-store"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(getAllThreats())
}
