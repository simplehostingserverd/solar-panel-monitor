import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createEnphaseAPI } from "@/lib/api/enphase-helper"
import { isAxiosError } from "@/lib/utils"

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
    const startAt = searchParams.get('start_at')
    const endAt = searchParams.get('end_at')

    const api = createEnphaseAPI()

    const consumption = await api.getConsumptionData(
      process.env.ENPHASE_SITE_ID!,
      startAt ? parseInt(startAt) : undefined,
      endAt ? parseInt(endAt) : undefined
    )

    return NextResponse.json(consumption)
  } catch (error) {
    console.error("Consumption API error:", isAxiosError(error) ? (error.response?.data || error.message) : error)
    return NextResponse.json(
      { error: isAxiosError(error) ? error.response?.data : "Failed to fetch consumption data" },
      { status: isAxiosError(error) ? (error.response?.status || 500) : 500 }
    )
  }
}
