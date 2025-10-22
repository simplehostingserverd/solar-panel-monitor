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
    const serialNum = searchParams.get('serial_num')

    if (!serialNum) {
      return NextResponse.json(
        { error: "serial_num parameter is required" },
        { status: 400 }
      )
    }

    const api = createEnphaseAPI(
      process.env.ENPHASE_API_KEY!,
      process.env.ENPHASE_ACCESS_TOKEN!
    )

    const systemId = await api.getSystemIdBySerial(serialNum)

    return NextResponse.json({ system_id: systemId })
  } catch (error) {
    const errorMessage = isAxiosError(error) ? (error.response?.data || error.message) : "System ID retrieval API error"
    console.error("System ID retrieval API error:", errorMessage)
    return NextResponse.json(
      { error: isAxiosError(error) ? error.response?.data : "Failed to retrieve system ID" },
      { status: isAxiosError(error) ? (error.response?.status || 500) : 500 }
    )
  }
}
