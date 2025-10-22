"use client"

import { format } from "date-fns"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface ProductionChartProps {
  data: {
    intervals: Array<{
      end_at: number
      wh_del: number
      powr: number
    }>
  }
}

export function ProductionChart({ data }: ProductionChartProps) {
  const chartData = data?.intervals?.map((interval) => ({
    time: format(new Date(interval.end_at * 1000), 'HH:mm'),
    energy: interval.wh_del, // Keep raw watt-hours
    power: interval.powr, // Keep raw watts
  })) || []

  // Helper to format power values
  const formatPower = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} kW`
    }
    return `${value.toFixed(0)} W`
  }

  // Helper to format energy values
  const formatEnergy = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} kWh`
    }
    return `${value.toFixed(0)} Wh`
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="time"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatPower}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Power
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {formatPower(Number(payload[0].value))}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Energy
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {formatEnergy(Number(payload[1]?.value))}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="power"
          strokeWidth={2}
          stroke="hsl(var(--primary))"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="energy"
          strokeWidth={2}
          stroke="hsl(var(--secondary))"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
