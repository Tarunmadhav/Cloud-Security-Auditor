"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import type { Vulnerability } from "@/lib/types"

const COLORS: Record<string, string> = {
  critical: "oklch(0.65 0.25 25)",
  high: "oklch(0.75 0.2 55)",
  medium: "oklch(0.85 0.18 85)",
  low: "oklch(0.75 0.18 155)",
  info: "oklch(0.7 0.15 240)",
}

export function SeverityDonutChart({
  vulnerabilities,
}: {
  vulnerabilities: Vulnerability[]
}) {
  const data = Object.entries(
    vulnerabilities.reduce<Record<string, number>>((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const total = vulnerabilities.length

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          Severity Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || "#666"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.012 260)",
                  border: "1px solid oklch(0.28 0.015 260)",
                  borderRadius: "6px",
                  color: "oklch(0.93 0.01 260)",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  `${value} (${((value / total) * 100).toFixed(0)}%)`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                fill="oklch(0.93 0.01 260)"
                fontSize="28"
                fontWeight="bold"
              >
                {total}
              </text>
              <text
                x="50%"
                y="57%"
                textAnchor="middle"
                fill="oklch(0.65 0.01 260)"
                fontSize="11"
              >
                Total
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          {data.map((entry) => (
            <span key={entry.name} className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: COLORS[entry.name] }}
              />
              <span className="capitalize">{entry.name}</span>
              <span className="text-muted-foreground">{entry.value}</span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
