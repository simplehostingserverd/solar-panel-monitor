"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductionChart } from "@/components/production-chart"
import { ConsumptionChart } from "@/components/consumption-chart"
import { Zap, Activity, Sun, TrendingUp, Building2, Sparkles, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['summary'],
    queryFn: fetchSummary,
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
  })

  const { data: production, isLoading: productionLoading, error: productionError } = useQuery({
    queryKey: ['production'],
    queryFn: fetchProduction,
    refetchInterval: 15 * 60 * 1000,
    retry: 2,
  })

  const { data: consumption, isLoading: consumptionLoading, error: consumptionError } = useQuery({
    queryKey: ['consumption'],
    queryFn: fetchConsumption,
    refetchInterval: 15 * 60 * 1000,
    retry: 2,
  })

  // Check if there are any errors
  const hasErrors = summaryError || productionError || consumptionError

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Header with Company Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
            >
              <Building2 className="h-9 w-9 text-white" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold tracking-tight"
              >
                Bishop San Pedro Ozanam Center
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-1 flex items-center gap-2 text-blue-100"
              >
                <Sparkles className="h-4 w-4" />
                Solar Energy Monitoring System
              </motion.p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-end gap-3"
          >
            <div className="text-right">
              <div className="text-sm font-medium text-blue-100">Last Updated</div>
              <div className="text-lg font-semibold">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
              <motion.div
                animate={hasErrors ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                } : {
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: hasErrors ? 1 : 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`h-3 w-3 rounded-full ${
                  hasErrors
                    ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                    : 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]'
                }`}
              />
              <span className="text-sm font-medium">
                {hasErrors ? 'Offline' : 'Online'}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Error Alert Banner */}
      {hasErrors && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive" className="border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <WifiOff className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">Connection Issue Detected</AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Unable to connect to Enphase inverters. Please ensure:
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Inverters are connected to WiFi network</li>
                <li>Inverters are powered on and online</li>
                <li>Your Enphase account credentials are correct</li>
                <li>Site ID (1569479) is correct</li>
              </ul>
              <p className="mt-2 text-sm">The dashboard will automatically retry every 5 minutes.</p>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Animated Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={cardVariants}>
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-amber-950 dark:to-orange-950">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-amber-400/20 blur-2xl transition-all group-hover:scale-150"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">Current Power</CardTitle>
              <motion.div
                animate={{ rotate: summaryLoading ? 360 : 0 }}
                transition={{ duration: 1, repeat: summaryLoading ? Infinity : 0, ease: "linear" }}
              >
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                {summaryLoading ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-9 w-24 rounded-lg bg-amber-200 dark:bg-amber-800"
                  />
                ) : (
                  formatPower(summary?.current_power || 0)
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                Live production
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-yellow-950 dark:to-amber-950">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-yellow-400/20 blur-2xl transition-all group-hover:scale-150"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Today&apos;s Energy</CardTitle>
              <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                {summaryLoading ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-9 w-24 rounded-lg bg-yellow-200 dark:bg-yellow-800"
                  />
                ) : (
                  formatEnergy(summary?.energy_today || 0)
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-yellow-700 dark:text-yellow-300">
                Energy produced today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-emerald-950 dark:to-green-950">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-400/20 blur-2xl transition-all group-hover:scale-150"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Lifetime Energy</CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                {summaryLoading ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-9 w-24 rounded-lg bg-emerald-200 dark:bg-emerald-800"
                  />
                ) : (
                  formatEnergy(summary?.energy_lifetime || 0)
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Total energy produced
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-blue-950 dark:to-indigo-950">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-400/20 blur-2xl transition-all group-hover:scale-150"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">System Status</CardTitle>
              <motion.div
                animate={summaryLoading ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: summaryLoading ? Infinity : 0 }}
              >
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {summaryLoading ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-9 w-24 rounded-lg bg-blue-200 dark:bg-blue-800"
                  />
                ) : (
                  summary?.status || "Unknown"
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                {summaryLoading ? "" : `${production?.total_devices || 0} devices reporting`}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Tabs defaultValue="production" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
            <TabsTrigger value="production" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white">
              Production
            </TabsTrigger>
            <TabsTrigger value="consumption" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white">
              Consumption
            </TabsTrigger>
          </TabsList>

          <TabsContent value="production" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <CardTitle className="text-xl">Solar Production</CardTitle>
                  <CardDescription>Last 24 hours of solar energy production</CardDescription>
                </CardHeader>
                <CardContent className="pl-2 pt-6">
                  {productionLoading ? (
                    <div className="flex h-[350px] items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sun className="h-12 w-12 text-blue-600" />
                      </motion.div>
                    </div>
                  ) : (
                    <ProductionChart data={production} />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="consumption" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                  <CardTitle className="text-xl">Energy Consumption</CardTitle>
                  <CardDescription>Last 24 hours of energy consumption</CardDescription>
                </CardHeader>
                <CardContent className="pl-2 pt-6">
                  {consumptionLoading ? (
                    <div className="flex h-[350px] items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Activity className="h-12 w-12 text-purple-600" />
                      </motion.div>
                    </div>
                  ) : (
                    <ConsumptionChart data={consumption} />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
