"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SeverityBadge } from "@/components/severity-badge"
import { complianceFrameworks } from "@/lib/mock-data"
import { CheckCircle, XCircle, Minus, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ComplianceStatus, Severity } from "@/lib/types"

const statusIcons: Record<ComplianceStatus, { icon: typeof CheckCircle; className: string }> = {
  pass: { icon: CheckCircle, className: "text-severity-low" },
  fail: { icon: XCircle, className: "text-severity-critical" },
  na: { icon: Minus, className: "text-muted-foreground" },
}

export default function CompliancePage() {
  const [activeFramework, setActiveFramework] = useState(
    complianceFrameworks[0].shortName
  )

  const framework = complianceFrameworks.find(
    (f) => f.shortName === activeFramework
  )!

  const scoreColor =
    framework.score >= 90
      ? "text-severity-low"
      : framework.score >= 75
        ? "text-severity-medium"
        : framework.score >= 60
          ? "text-severity-high"
          : "text-severity-critical"

  const circumference = 2 * Math.PI * 54
  const strokeDashoffset =
    circumference - (framework.score / 100) * circumference

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compliance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Audit your infrastructure against industry compliance frameworks
        </p>
      </div>

      {/* Framework Tabs */}
      <Tabs value={activeFramework} onValueChange={setActiveFramework}>
        <TabsList className="bg-muted">
          {complianceFrameworks.map((fw) => (
            <TabsTrigger key={fw.shortName} value={fw.shortName}>
              {fw.shortName} ({fw.score}%)
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Score + Summary */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="border-border bg-card lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="relative size-32">
              <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="oklch(0.22 0.015 260)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={
                    framework.score >= 90
                      ? "oklch(0.75 0.18 155)"
                      : framework.score >= 75
                        ? "oklch(0.85 0.18 85)"
                        : "oklch(0.75 0.2 55)"
                  }
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-3xl font-bold", scoreColor)}>
                  {framework.score}%
                </span>
                <span className="text-xs text-muted-foreground">Score</span>
              </div>
            </div>
            <h3 className="mt-4 text-sm font-medium text-card-foreground text-center">
              {framework.name}
            </h3>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 lg:col-span-3">
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <CheckCircle className="size-8 text-severity-low mb-2" />
              <span className="text-2xl font-bold text-card-foreground">
                {framework.passedControls}
              </span>
              <span className="text-xs text-muted-foreground">Passed</span>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <XCircle className="size-8 text-severity-critical mb-2" />
              <span className="text-2xl font-bold text-card-foreground">
                {framework.failedControls}
              </span>
              <span className="text-xs text-muted-foreground">Failed</span>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <ShieldCheck className="size-8 text-muted-foreground mb-2" />
              <span className="text-2xl font-bold text-card-foreground">
                {framework.totalControls}
              </span>
              <span className="text-xs text-muted-foreground">Total Controls</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Controls ({framework.controls.length} shown)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground w-16">Status</TableHead>
                <TableHead className="text-muted-foreground w-24">Control ID</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {framework.controls.map((ctrl) => {
                const StatusIcon = statusIcons[ctrl.status as ComplianceStatus].icon
                const statusClass = statusIcons[ctrl.status as ComplianceStatus].className
                return (
                  <TableRow key={ctrl.id} className="border-border hover:bg-accent/50">
                    <TableCell>
                      <StatusIcon className={cn("size-4", statusClass)} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-card-foreground">
                      {ctrl.controlId}
                    </TableCell>
                    <TableCell className="text-sm text-card-foreground">
                      {ctrl.description}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {ctrl.category}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={ctrl.severity as Severity} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Remediation Recommendations */}
      {framework.controls.filter((c) => c.status === "fail").length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-severity-critical">
              Failed Controls - Remediation Required
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {framework.controls
              .filter((c) => c.status === "fail")
              .map((ctrl) => (
                <div
                  key={ctrl.id}
                  className="flex items-start gap-3 rounded-lg border border-severity-critical/20 bg-severity-critical/5 p-3"
                >
                  <XCircle className="size-4 text-severity-critical mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-card-foreground">
                      [{ctrl.controlId}] {ctrl.description}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Category: {ctrl.category} | Severity: {ctrl.severity}
                    </span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
