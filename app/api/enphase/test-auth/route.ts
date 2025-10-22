import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createEnphaseAPI } from "@/lib/api/enphase-helper"

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 }
      )
    }

    // Check if tokens are configured
    const hasApiKey = !!process.env.ENPHASE_API_KEY
    const hasAccessToken = !!process.env.ENPHASE_ACCESS_TOKEN
    const hasRefreshToken = !!process.env.ENPHASE_REFRESH_TOKEN
    const hasClientId = !!process.env.ENPHASE_CLIENT_ID
    const hasClientSecret = !!process.env.ENPHASE_CLIENT_SECRET
    const hasSiteId = !!process.env.ENPHASE_SITE_ID

    if (!hasAccessToken || process.env.ENPHASE_ACCESS_TOKEN === '') {
      return NextResponse.json({
        status: "error",
        message: "ENPHASE_ACCESS_TOKEN is not set. Please visit /get-token to authorize.",
        config: {
          hasApiKey,
          hasAccessToken,
          hasRefreshToken,
          hasClientId,
          hasClientSecret,
          hasSiteId,
        }
      }, { status: 400 })
    }

    // Try to make a simple API call to test authentication
    try {
      const api = createEnphaseAPI()
      const summary = await api.getSystemSummary(process.env.ENPHASE_SITE_ID!)

      return NextResponse.json({
        status: "success",
        message: "Enphase API authentication is working correctly!",
        config: {
          hasApiKey,
          hasAccessToken,
          hasRefreshToken,
          hasClientId,
          hasClientSecret,
          hasSiteId,
        },
        sample_data: {
          system_id: summary.system_id,
          current_power: summary.current_power,
          status: summary.status,
        }
      })
    } catch (apiError: any) {
      return NextResponse.json({
        status: "error",
        message: "API call failed. Token may be invalid or expired.",
        error: apiError.response?.data || apiError.message,
        config: {
          hasApiKey,
          hasAccessToken,
          hasRefreshToken,
          hasClientId,
          hasClientSecret,
          hasSiteId,
        },
        suggestion: "Visit /get-token to get new tokens, or try /api/enphase/refresh-token to refresh your existing token."
      }, { status: 401 })
    }
  } catch (error: any) {
    console.error("Test auth error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to test authentication" },
      { status: 500 }
    )
  }
}
