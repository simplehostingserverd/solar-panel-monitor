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
    const eventTypeId = searchParams.get('event_type_id')

    const api = createEnphaseAPI(
      process.env.ENPHASE_API_KEY!,
      process.env.ENPHASE_ACCESS_TOKEN!
    )

    const eventTypes = await api.getEventTypes(
      eventTypeId ? parseInt(eventTypeId) : undefined
    )

    return NextResponse.json(eventTypes)
  } catch (error: any) {
    console.error("Event Types API error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || "Failed to fetch event types" },
      { status: error.response?.status || 500 }
    )
  }
}
