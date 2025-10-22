"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SolarDashboard } from "@/components/solar-dashboard"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div>
            <h1 className="text-2xl font-bold">Bishop San Pedro Ozanam Center</h1>
            <p className="text-sm text-muted-foreground">Solar Panel Monitoring</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/api/auth/signout")}>
            Sign Out
          </Button>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        <SolarDashboard />
      </main>
    </div>
  )
}
