import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createEnphaseAPI } from "@/lib/api/enphase-helper"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { page, size, params } = body

    const api = createEnphaseAPI(
      process.env.ENPHASE_API_KEY!,
      process.env.ENPHASE_ACCESS_TOKEN!
    )

    const systems = await api.searchSystems(page, size, params)

    return NextResponse.json(systems)
  } catch (error: any) {
    console.error("Systems search API error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || "Failed to search systems" },
      { status: error.response?.status || 500 }
    )
  }
}
