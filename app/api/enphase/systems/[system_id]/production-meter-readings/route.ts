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
    const endAt = searchParams.get('end_at')

    const api = createEnphaseAPI(
      process.env.ENPHASE_API_KEY!,
      process.env.ENPHASE_ACCESS_TOKEN!
    )

    const readings = await api.getProductionMeterReadings(
      params.system_id,
      endAt ? parseInt(endAt) : undefined
    )

    return NextResponse.json(readings)
  } catch (error) {
    const errorMessage = isAxiosError(error) ? (error.response?.data || error.message) : "Production meter readings API error"
    console.error("Production meter readings API error:", errorMessage)
    return NextResponse.json(
      { error: isAxiosError(error) ? error.response?.data : "Failed to fetch production meter readings" },
      { status: isAxiosError(error) ? (error.response?.status || 500) : 500 }
    )
  }
}
