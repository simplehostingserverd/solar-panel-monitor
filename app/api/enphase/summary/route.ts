import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createEnphaseAPI } from "@/lib/api/enphase-helper"
import { isAxiosError } from "@/lib/utils"

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const api = createEnphaseAPI()

    const summary = await api.getSystemSummary(process.env.ENPHASE_SITE_ID!)

    return NextResponse.json(summary)
  } catch (error) {
    const errorMessage = isAxiosError(error) ? (error.response?.data || error.message) : "Summary API error"
    console.error("Summary API error:", errorMessage)
    return NextResponse.json(
      { error: isAxiosError(error) ? error.response?.data : "Failed to fetch summary" },
      { status: isAxiosError(error) ? (error.response?.status || 500) : 500 }
    )
  }
}
