"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"

function GetTokenContent() {
  const searchParams = useSearchParams()
  const [accessToken, setAccessToken] = useState<string>("")
  const [refreshToken, setRefreshToken] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const code = searchParams.get("code")
    if (code && !accessToken && !loading) {
      fetchToken(code)
    }
  }, [searchParams, accessToken, loading])

  const fetchToken = async (code: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/enphase/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setAccessToken(data.access_token)
        setRefreshToken(data.refresh_token)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGetToken = () => {
    const authUrl = `https://api.enphaseenergy.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_ENPHASE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/get-token')}`
    window.location.href = authUrl
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Get Enphase Access Token</CardTitle>
          <CardDescription>
            Use this page to get your Enphase access token for the .env file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!accessToken && !loading && !error && (
            <Button onClick={handleGetToken} className="w-full">
              Authorize with Enphase
            </Button>
          )}

          {loading && (
            <Alert>
              <p>Getting your access token...</p>
            </Alert>
          )}

          {error && (
            <Alert>
              <p className="text-red-500">Error: {error}</p>
            </Alert>
          )}

          {accessToken && (
            <div className="space-y-4">
              <Alert>
                <p className="font-semibold text-green-600">Success! Tokens automatically saved to .env file!</p>
              </Alert>

              <Alert>
                <p className="font-semibold mb-2">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Stop your development server (Ctrl+C)</li>
                  <li>Restart it with <code className="bg-muted px-1 rounded">npm run dev</code> or <code className="bg-muted px-1 rounded">pnpm dev</code></li>
                  <li>Navigate to the dashboard to view your solar data!</li>
                </ol>
              </Alert>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium mb-2">View tokens (for reference)</summary>
                <div className="space-y-2 mt-2">
                  <div>
                    <p className="text-sm font-medium mb-1">ENPHASE_ACCESS_TOKEN:</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">{accessToken}</pre>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">ENPHASE_REFRESH_TOKEN:</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">{refreshToken}</pre>
                  </div>
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function GetTokenPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <GetTokenContent />
    </Suspense>
  )
}
