"use client"

import { Suspense, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"

function AuthenticateContent() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [accessToken, setAccessToken] = useState<string>("")
  const [refreshToken, setRefreshToken] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/enphase/get-token-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setAccessToken(data.access_token)
        setRefreshToken(data.refresh_token)
        setUserId(data.enl_uid)
        // Clear password for security
        setPassword("")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Enphase Authentication</CardTitle>
          <CardDescription>
            Enter your Enphase Enlighten credentials to get API access tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!accessToken && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Enphase Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Enphase Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your Enlighten password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Alert>
                <p className="text-sm">
                  Your credentials are sent directly to Enphase and are not stored.
                  They are only used to generate API tokens.
                </p>
              </Alert>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Get Access Tokens"}
              </Button>
            </form>
          )}

          {loading && (
            <Alert>
              <p>Authenticating with Enphase...</p>
            </Alert>
          )}

          {error && (
            <Alert>
              <p className="text-red-500">Error: {error}</p>
              <p className="text-sm mt-2">
                Please check your credentials and try again.
              </p>
            </Alert>
          )}

          {accessToken && (
            <div className="space-y-4">
              <Alert>
                <p className="font-semibold text-green-600">Success! Tokens automatically saved to .env file!</p>
              </Alert>

              <Alert>
                <p className="font-semibold">Your User ID: {userId}</p>
              </Alert>

              <Alert>
                <p className="font-semibold mb-2">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Stop your development server (Ctrl+C)</li>
                  <li>Restart it with <code className="bg-muted px-1 rounded">npm run dev</code> or <code className="bg-muted px-1 rounded">pnpm dev</code></li>
                  <li>Check what systems you have access to at <a href="/check-systems" className="underline">/check-systems</a></li>
                  <li>Navigate to the dashboard to view your solar data!</li>
                </ol>
              </Alert>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium mb-2">View tokens (for reference)</summary>
                <div className="space-y-2 mt-2">
                  <div>
                    <p className="text-sm font-medium mb-1">ENPHASE_ACCESS_TOKEN:</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto break-all">{accessToken}</pre>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">ENPHASE_REFRESH_TOKEN:</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto break-all">{refreshToken}</pre>
                  </div>
                </div>
              </details>

              <Button
                onClick={() => {
                  setAccessToken("")
                  setRefreshToken("")
                  setUserId("")
                  setEmail("")
                }}
                variant="outline"
                className="w-full"
              >
                Authenticate Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthenticatePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AuthenticateContent />
    </Suspense>
  )
}
