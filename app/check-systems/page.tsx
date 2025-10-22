"use client"

import { Suspense, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"

interface System {
  system_id: number
  name: string
  public_name: string
  timezone: string
  address: {
    address1: string
    address2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  connection_type: string
  status: string
  last_report_at: number
  operational_at: number
  reference?: string
}

function CheckSystemsContent() {
  const [systems, setSystems] = useState<System[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [fetched, setFetched] = useState(false)

  const fetchSystems = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/enphase/systems")
      const data = await response.json()

      if (data.error) {
        setError(JSON.stringify(data.error, null, 2))
      } else {
        setSystems(data.systems || [])
        setFetched(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Check Enphase Systems Access</CardTitle>
            <CardDescription>
              This will show all systems you have access to via the Enphase API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!fetched && !loading && (
              <div className="space-y-4">
                <Alert>
                  <p>Click the button below to check what systems you have access to.</p>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Note: You need to have valid access tokens in your .env file.
                    If you don&apos;t have tokens yet, visit <a href="/get-token" className="underline">/get-token</a> first.
                  </p>
                </Alert>
                <Button onClick={fetchSystems} className="w-full">
                  Check My Systems
                </Button>
              </div>
            )}

            {loading && (
              <Alert>
                <p>Fetching your systems from Enphase API...</p>
              </Alert>
            )}

            {error && (
              <Alert>
                <p className="font-semibold text-red-600 mb-2">Error:</p>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">{error}</pre>
                <p className="text-sm mt-3">
                  If you see an authentication error, you may need to get new tokens at <a href="/get-token" className="underline">/get-token</a>
                </p>
              </Alert>
            )}

            {fetched && !loading && !error && (
              <div className="space-y-4">
                <Alert>
                  <p className="font-semibold text-green-600">
                    Found {systems.length} system{systems.length !== 1 ? 's' : ''}
                  </p>
                </Alert>

                {systems.length === 0 && (
                  <Alert>
                    <p className="font-semibold">No systems found</p>
                    <p className="text-sm mt-2">
                      This means your Enphase account doesn&apos;t own any systems or doesn&apos;t have API access to any systems.
                    </p>
                    <p className="text-sm mt-2">
                      To get API access to &quot;Ozanam 210 Family Unit&quot; or any other system:
                    </p>
                    <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                      <li>Contact the system owner</li>
                      <li>Ask them to grant you API access in their Enphase Enlighten settings</li>
                      <li>Or ask them to go through the OAuth flow at /get-token and share the tokens with you</li>
                    </ol>
                  </Alert>
                )}

                {systems.map((system) => (
                  <Card key={system.system_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{system.name}</CardTitle>
                      <CardDescription>
                        System ID: {system.system_id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Public Name:</p>
                          <p className="text-muted-foreground">{system.public_name}</p>
                        </div>
                        <div>
                          <p className="font-medium">Status:</p>
                          <p className="text-muted-foreground">{system.status}</p>
                        </div>
                        <div>
                          <p className="font-medium">Connection Type:</p>
                          <p className="text-muted-foreground">{system.connection_type}</p>
                        </div>
                        <div>
                          <p className="font-medium">Timezone:</p>
                          <p className="text-muted-foreground">{system.timezone}</p>
                        </div>
                        <div>
                          <p className="font-medium">Last Report:</p>
                          <p className="text-muted-foreground">{formatDate(system.last_report_at)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Operational Since:</p>
                          <p className="text-muted-foreground">{formatDate(system.operational_at)}</p>
                        </div>
                        <div className="col-span-full">
                          <p className="font-medium">Address:</p>
                          <p className="text-muted-foreground">
                            {system.address.address1}
                            {system.address.address2 && `, ${system.address.address2}`}
                            <br />
                            {system.address.city}, {system.address.state} {system.address.postal_code}
                            <br />
                            {system.address.country}
                          </p>
                        </div>
                        {system.reference && (
                          <div className="col-span-full">
                            <p className="font-medium">Reference:</p>
                            <p className="text-muted-foreground">{system.reference}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button onClick={fetchSystems} variant="outline" className="w-full">
                  Refresh Systems List
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckSystemsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <CheckSystemsContent />
    </Suspense>
  )
}
