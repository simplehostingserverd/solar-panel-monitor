"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    const code = searchParams.get("code")
    if (code && !isLoading) {
      setIsLoading(true)
      signIn("credentials", {
        code,
        callbackUrl: "/",
      })
    }
  }, [searchParams, isLoading])

  const handleLogin = () => {
    const authUrl = `https://api.enphaseenergy.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_ENPHASE_CLIENT_ID || '00a39c3d2a6062b3cabfe389953ebd22'}&redirect_uri=${encodeURIComponent(window.location.origin + '/login')}`
    window.location.href = authUrl
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Sun className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Bishop San Pedro Ozanam Center</CardTitle>
          <CardDescription>
            Solar Panel Consumption Monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Authenticating...</p>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={isLoading}
            >
              Sign in with Enphase
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
