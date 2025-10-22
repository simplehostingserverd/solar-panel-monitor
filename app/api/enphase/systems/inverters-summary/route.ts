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
    const siteId = searchParams.get('site_id')
    const envoySerialNumber = searchParams.get('envoy_serial_number')
    const page = searchParams.get('page')
    const size = searchParams.get('size')

    if (!siteId && !envoySerialNumber) {
      return NextResponse.json(
        { error: "Either site_id or envoy_serial_number is required" },
        { status: 400 }
      )
    }

    const api = createEnphaseAPI(
      process.env.ENPHASE_API_KEY!,
      process.env.ENPHASE_ACCESS_TOKEN!
    )

    const summary = await api.getInvertersSummary(
      siteId || undefined,
      envoySerialNumber || undefined,
      page ? parseInt(page) : undefined,
      size ? parseInt(size) : undefined
    )

    return NextResponse.json(summary)
  } catch (error) {
    const errorMessage = isAxiosError(error) ? (error.response?.data || error.message) : "Inverters summary API error"
    console.error("Inverters summary API error:", errorMessage)
    return NextResponse.json(
      { error: isAxiosError(error) ? error.response?.data : "Failed to fetch inverters summary" },
      { status: isAxiosError(error) ? (error.response?.status || 500) : 500 }
    )
  }
}
