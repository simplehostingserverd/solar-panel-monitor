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
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const api = createEnphaseAPI(
      process.env.ENPHASE_API_KEY!,
      process.env.ENPHASE_ACCESS_TOKEN!
    )

    const batteryLifetime = await api.getBatteryLifetime(
      params.system_id,
      startDate || undefined,
      endDate || undefined
    )

    return NextResponse.json(batteryLifetime)
  } catch (error) {
    const errorMessage = isAxiosError(error) ? (error.response?.data || error.message) : "Battery lifetime API error"
    console.error("Battery lifetime API error:", errorMessage)
    return NextResponse.json(
      { error: isAxiosError(error) ? error.response?.data : "Failed to fetch battery lifetime" },
      { status: isAxiosError(error) ? (error.response?.status || 500) : 500 }
    )
  }
}
