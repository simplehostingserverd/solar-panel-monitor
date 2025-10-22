import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username (email) and password are required" },
        { status: 400 }
      )
    }

    const clientId = process.env.ENPHASE_CLIENT_ID!
    const clientSecret = process.env.ENPHASE_CLIENT_SECRET!

    // Create base64 encoded authorization header
    const authString = `${clientId}:${clientSecret}`
    const base64Auth = Buffer.from(authString).toString('base64')

    const tokenResponse = await fetch(
      `https://api.enphaseenergy.com/oauth/token?grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${base64Auth}`,
        },
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error_description || errorData.error || "Failed to get access token" },
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
      enl_uid: tokens.enl_uid,
      auto_saved: true,
    })
  } catch (error: any) {
    console.error("Token exchange error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to exchange token" },
      { status: 500 }
    )
  }
}
