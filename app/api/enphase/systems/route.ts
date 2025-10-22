import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createEnphaseAPI } from "@/lib/api/enphase-helper"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    const sortBy = searchParams.get('sort_by')

    const api = createEnphaseAPI()

    const systems = await api.getSystems(
      page ? parseInt(page) : undefined,
      size ? parseInt(size) : undefined,
      sortBy || undefined
    )

    return NextResponse.json(systems)
  } catch (error: any) {
    console.error("Systems API error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || "Failed to fetch systems" },
      { status: error.response?.status || 500 }
    )
  }
}
