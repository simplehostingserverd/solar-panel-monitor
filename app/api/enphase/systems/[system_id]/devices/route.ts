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

    const api = createEnphaseAPI(
      process.env.ENPHASE_API_KEY!,
      process.env.ENPHASE_ACCESS_TOKEN!
    )

    const devices = await api.getDevices(params.system_id)

    return NextResponse.json(devices)
  } catch (error: any) {
    console.error("Devices API error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || "Failed to fetch devices" },
      { status: error.response?.status || 500 }
    )
  }
}
