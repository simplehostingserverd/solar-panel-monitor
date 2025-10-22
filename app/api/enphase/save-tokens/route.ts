import { NextRequest, NextResponse } from "next/server"
import { writeFile, readFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json()

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: "Both access_token and refresh_token are required" },
        { status: 400 }
      )
    }

    // Path to .env file
    const envPath = path.join(process.cwd(), ".env")

    // Read current .env file
    const envContent = await readFile(envPath, "utf-8")

    // Update the tokens
    let updatedContent = envContent.replace(
      /ENPHASE_ACCESS_TOKEN=.*/,
      `ENPHASE_ACCESS_TOKEN=${access_token}`
    )
    updatedContent = updatedContent.replace(
      /ENPHASE_REFRESH_TOKEN=.*/,
      `ENPHASE_REFRESH_TOKEN=${refresh_token}`
    )

    // Write back to .env file
    await writeFile(envPath, updatedContent, "utf-8")

    return NextResponse.json({
      success: true,
      message: "Tokens saved to .env file successfully. Please restart your dev server for changes to take effect.",
    })
  } catch (error: any) {
    console.error("Failed to save tokens:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save tokens to .env file" },
      { status: 500 }
    )
  }
}
