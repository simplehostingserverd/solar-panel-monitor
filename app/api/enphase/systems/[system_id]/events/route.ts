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
    const startTime = searchParams.get('start_time')
    const endTime = searchParams.get('end_time')

    if (!startTime) {
      return NextResponse.json(
        { error: "start_time parameter is required" },
        { status: 400 }
      )
    }

    const api = createEnphaseAPI(
      process.env.ENPHASE_API_KEY!,
      process.env.ENPHASE_ACCESS_TOKEN!
    )

    const events = await api.getEvents(
      params.system_id,
      parseInt(startTime),
      endTime ? parseInt(endTime) : undefined
    )

    return NextResponse.json(events)
  } catch (error: any) {
    console.error("Events API error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || "Failed to fetch events" },
      { status: error.response?.status || 500 }
    )
  }
}
