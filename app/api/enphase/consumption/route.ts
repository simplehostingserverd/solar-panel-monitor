import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { EnphaseAPI } from "@/lib/api/enphase"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const startAt = searchParams.get('start_at')
    const endAt = searchParams.get('end_at')

    const api = new EnphaseAPI(
      process.env.ENPHASE_API_KEY!,
      session.accessToken
    )

    const consumption = await api.getConsumptionData(
      process.env.ENPHASE_SITE_ID!,
      startAt ? parseInt(startAt) : undefined,
      endAt ? parseInt(endAt) : undefined
    )

    return NextResponse.json(consumption)
  } catch (error: any) {
    console.error("Consumption API error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || "Failed to fetch consumption data" },
      { status: error.response?.status || 500 }
    )
  }
}
