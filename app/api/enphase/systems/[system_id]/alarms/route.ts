import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createEnphaseAPI } from "@/lib/api/enphase-helper"
import { isAxiosError } from "@/lib/utils"

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
    const cleared = searchParams.get('cleared')

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

    const alarms = await api.getAlarms(
      params.system_id,
      parseInt(startTime),
      endTime ? parseInt(endTime) : undefined,
      cleared ? cleared === 'true' : undefined
    )

    return NextResponse.json(alarms)
  } catch (error) {
    const errorMessage = isAxiosError(error) ? (error.response?.data || error.message) : "Alarms API error"
    console.error("Alarms API error:", errorMessage)
    return NextResponse.json(
      { error: isAxiosError(error) ? error.response?.data : "Failed to fetch alarms" },
      { status: isAxiosError(error) ? (error.response?.status || 500) : 500 }
    )
  }
}
