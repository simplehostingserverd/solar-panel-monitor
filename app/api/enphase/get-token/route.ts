import { NextRequest, NextResponse } from "next/server"
import { isAxiosError } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
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
          grant_type: "authorization_code",
          code: code,
          client_id: process.env.ENPHASE_CLIENT_ID!,
          client_secret: process.env.ENPHASE_CLIENT_SECRET!,
          redirect_uri: `${process.env.NEXTAUTH_URL}/get-token`,
        }),
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to get access token" },
        { status: tokenResponse.status }
      )
    }

    const tokens = await tokenResponse.json()

    // Automatically save tokens to .env file
    try {
      const saveResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/enphase/save-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        }),
      })

      const saveResult = await saveResponse.json()

      if (!saveResult.success) {
        console.error("Failed to auto-save tokens:", saveResult.error)
      }
    } catch (saveError) {
      console.error("Error auto-saving tokens:", saveError)
      // Continue anyway, tokens will be returned to user
    }

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      auto_saved: true,
    })
  } catch (error) {
    const errorMessage = isAxiosError(error) ? (error.response?.data || error.message) : "Token exchange error"
    console.error("Token exchange error:", errorMessage)
    return NextResponse.json(
      { error: isAxiosError(error) ? error.response?.data : "Failed to exchange token" },
      { status: isAxiosError(error) ? (error.response?.status || 500) : 500 }
    )
  }
}
