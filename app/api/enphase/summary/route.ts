import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createEnphaseAPI } from "@/lib/api/enphase-helper"

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
  } catch (error: any) {
    console.error("Summary API error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || "Failed to fetch summary" },
      { status: error.response?.status || 500 }
    )
  }
}
