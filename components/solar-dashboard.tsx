"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductionChart } from "@/components/production-chart"
import { ConsumptionChart } from "@/components/consumption-chart"
import { Zap, Activity, Sun, TrendingUp } from "lucide-react"

async function fetchSummary() {
  const res = await fetch('/api/enphase/summary')
  if (!res.ok) throw new Error('Failed to fetch summary')
  return res.json()
}

async function fetchProduction() {
  const endAt = Math.floor(Date.now() / 1000)
  const startAt = endAt - (24 * 60 * 60)
  const res = await fetch(`/api/enphase/production?start_at=${startAt}&end_at=${endAt}`)
  if (!res.ok) throw new Error('Failed to fetch production')
  return res.json()
}

async function fetchConsumption() {
  const endAt = Math.floor(Date.now() / 1000)
  const startAt = endAt - (24 * 60 * 60)
  const res = await fetch(`/api/enphase/consumption?start_at=${startAt}&end_at=${endAt}`)
  if (!res.ok) throw new Error('Failed to fetch consumption')
  return res.json()
}

export function SolarDashboard() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: fetchSummary,
    refetchInterval: 5 * 60 * 1000,
  })

  const { data: production, isLoading: productionLoading } = useQuery({
    queryKey: ['production'],
    queryFn: fetchProduction,
    refetchInterval: 15 * 60 * 1000,
  })

  const { data: consumption, isLoading: consumptionLoading } = useQuery({
    queryKey: ['consumption'],
    queryFn: fetchConsumption,
    refetchInterval: 15 * 60 * 1000,
  })

  const formatPower = (watts: number) => {
    if (watts >= 1000) {
      return `${(watts / 1000).toFixed(2)} kW`
    }
    return `${watts.toFixed(0)} W`
  }

  const formatEnergy = (wh: number) => {
    if (wh >= 1000) {
      return `${(wh / 1000).toFixed(2)} kWh`
    }
    return `${wh.toFixed(0)} Wh`
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Power</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : formatPower(summary?.current_power || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Live production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Energy</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : formatEnergy(summary?.energy_today || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Energy produced today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Energy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : formatEnergy(summary?.energy_lifetime || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total energy produced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : summary?.status || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryLoading ? "" : `${production?.total_devices || 0} devices reporting`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="production" className="space-y-4">
        <TabsList>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solar Production</CardTitle>
              <CardDescription>Last 24 hours of solar energy production</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {productionLoading ? (
                <div className="flex h-[350px] items-center justify-center">
                  <p className="text-muted-foreground">Loading production data...</p>
                </div>
              ) : (
                <ProductionChart data={production} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Energy Consumption</CardTitle>
              <CardDescription>Last 24 hours of energy consumption</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {consumptionLoading ? (
                <div className="flex h-[350px] items-center justify-center">
                  <p className="text-muted-foreground">Loading consumption data...</p>
                </div>
              ) : (
                <ConsumptionChart data={consumption} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
