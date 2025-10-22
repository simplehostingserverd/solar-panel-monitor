import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { isAxiosError } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { refresh_token } = await request.json()

    // Use refresh token from env if not provided
    const refreshToken = refresh_token || process.env.ENPHASE_REFRESH_TOKEN

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      )
    }

    const tokenResponse = await fetch(
      "https://api.enphaseenergy.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.ENPHASE_CLIENT_ID!,
          client_secret: process.env.ENPHASE_CLIENT_SECRET!,
        }),
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to refresh access token" },
        { status: tokenResponse.status }
      )
    }

    const tokens = await tokenResponse.json()

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    })
  } catch (error) {
    const errorMessage = isAxiosError(error) ? (error.response?.data || error.message) : "Token refresh error"
    console.error("Token refresh error:", errorMessage)
    return NextResponse.json(
      { error: isAxiosError(error) ? error.response?.data : "Failed to refresh token" },
      { status: isAxiosError(error) ? (error.response?.status || 500) : 500 }
    )
  }
}
