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
    energy: interval.wh_del / 1000,
    power: interval.powr / 1000,
  })) || []

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
          tickFormatter={(value) => `${value.toFixed(1)} kW`}
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
                        {Number(payload[0].value).toFixed(2)} kW
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Energy
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {Number(payload[1]?.value).toFixed(2)} kWh
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
