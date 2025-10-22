import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createEnphaseAPI } from "@/lib/api/enphase-helper"

export async function GET(
  request: NextRequest,
  { params }: { params: { system_id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const startAt = searchParams.get('start_at')
    const endAt = searchParams.get('end_at')

    const api = createEnphaseAPI(
      process.env.ENPHASE_API_KEY!,
      process.env.ENPHASE_ACCESS_TOKEN!
    )

    const stats = await api.getRgmStats(
      params.system_id,
      startAt ? parseInt(startAt) : undefined,
      endAt ? parseInt(endAt) : undefined
    )

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("RGM stats API error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || "Failed to fetch RGM stats" },
      { status: error.response?.status || 500 }
    )
  }
}
