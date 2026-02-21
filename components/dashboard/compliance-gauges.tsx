"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { complianceFrameworks } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function GaugeRing({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 36
  const strokeDashoffset = circumference - (score / 100) * circumference
  const color =
    score >= 90
      ? "oklch(0.75 0.18 155)"
      : score >= 75
        ? "oklch(0.85 0.18 85)"
        : score >= 60
          ? "oklch(0.75 0.2 55)"
          : "oklch(0.65 0.25 25)"

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-24">
        <svg className="size-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="oklch(0.22 0.015 260)"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn("text-lg font-bold")}
            style={{ color }}
          >
            {score}%
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

export function ComplianceGauges() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-card-foreground">
          Compliance Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-around py-4">
          {complianceFrameworks.map((fw) => (
            <GaugeRing key={fw.shortName} score={fw.score} label={fw.shortName} />
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-1.5 text-xs text-muted-foreground">
          {complianceFrameworks.map((fw) => (
            <div key={fw.shortName} className="flex items-center justify-between">
              <span>{fw.name}</span>
              <span>
                {fw.passedControls}/{fw.totalControls} passed
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
