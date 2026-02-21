"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SeverityBadge } from "@/components/severity-badge"
import { threats } from "@/lib/mock-data"
import { AlertTriangle, Shield, Eye, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format-date"
import type { Threat, Severity, ThreatStatus } from "@/lib/types"

const statusConfig: Record<ThreatStatus, { label: string; className: string; icon: typeof AlertTriangle }> = {
  active: {
    label: "Active",
    className: "bg-severity-critical/15 text-severity-critical border-severity-critical/30",
    icon: AlertTriangle,
  },
  investigating: {
    label: "Investigating",
    className: "bg-severity-medium/15 text-severity-medium border-severity-medium/30",
    icon: Eye,
  },
  resolved: {
    label: "Resolved",
    className: "bg-severity-low/15 text-severity-low border-severity-low/30",
    icon: Shield,
  },
}

const severityDistribution = (() => {
  const counts: Record<string, number> = {}
  for (const t of threats) {
    counts[t.severity] = (counts[t.severity] || 0) + 1
  }
  return Object.entries(counts).map(([severity, count]) => ({
    severity,
    count,
  }))
})()

const COLORS: Record<string, string> = {
  critical: "oklch(0.65 0.25 25)",
  high: "oklch(0.75 0.2 55)",
  medium: "oklch(0.85 0.18 85)",
  low: "oklch(0.75 0.18 155)",
  info: "oklch(0.7 0.15 240)",
}

export default function ThreatsPage() {
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)

  const activeThreatCount = threats.filter((t) => t.status === "active").length
  const investigatingCount = threats.filter((t) => t.status === "investigating").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Threat Detection</h1>
            {activeThreatCount > 0 && (
              <Badge className="bg-severity-critical/15 text-severity-critical border-severity-critical/30">
                {activeThreatCount} active
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time threat monitoring and incident tracking
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-severity-critical/10">
              <AlertTriangle className="size-5 text-severity-critical" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-card-foreground">{activeThreatCount}</span>
              <span className="text-xs text-muted-foreground">Active Threats</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-severity-medium/10">
              <Eye className="size-5 text-severity-medium" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-card-foreground">{investigatingCount}</span>
              <span className="text-xs text-muted-foreground">Under Investigation</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-severity-low/10">
              <Shield className="size-5 text-severity-low" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-card-foreground">{threats.length}</span>
              <span className="text-xs text-muted-foreground">Total Detected</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Timeline */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Severity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.015 260)" horizontal={false} />
                  <XAxis type="number" stroke="oklch(0.5 0.01 260)" fontSize={10} />
                  <YAxis
                    type="category"
                    dataKey="severity"
                    stroke="oklch(0.5 0.01 260)"
                    fontSize={10}
                    width={60}
                    tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.17 0.012 260)",
                      border: "1px solid oklch(0.28 0.015 260)",
                      borderRadius: "6px",
                      color: "oklch(0.93 0.01 260)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    fill="oklch(0.75 0.15 190)"
                    label={false}
                  >
                    {severityDistribution.map((entry) => (
                      <rect key={entry.severity} fill={COLORS[entry.severity] || "#666"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Threat Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative flex flex-col gap-0">
              {[...threats]
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )
                .slice(0, 6)
                .map((threat, i) => {
                  const StatusIcon = statusConfig[threat.status as ThreatStatus].icon
                  return (
                    <div key={threat.id} className="relative flex gap-3 pb-4">
                      {i < 5 && (
                        <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
                      )}
                      <div className="relative z-10 mt-0.5">
                        <div
                          className={cn(
                            "flex size-6 items-center justify-center rounded-full",
                            threat.status === "active"
                              ? "bg-severity-critical/20"
                              : threat.status === "investigating"
                                ? "bg-severity-medium/20"
                                : "bg-severity-low/20"
                          )}
                        >
                          <StatusIcon
                            className={cn("size-3", {
                              "text-severity-critical": threat.status === "active",
                              "text-severity-medium": threat.status === "investigating",
                              "text-severity-low": threat.status === "resolved",
                            })}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="flex flex-1 flex-col gap-0.5 rounded-lg border border-border bg-background/50 p-2.5 text-left hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedThreat(threat)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-card-foreground">
                            {threat.type}
                          </span>
                          <SeverityBadge severity={threat.severity as Severity} />
                        </div>
                        <span className="text-[10px] text-muted-foreground line-clamp-1">
                          {threat.description}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <Clock className="size-2.5" />
                          {formatDate(threat.timestamp)}
                        </div>
                      </button>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Threats Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            All Threats ({threats.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Severity</TableHead>
                <TableHead className="text-muted-foreground">Source</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Related</TableHead>
                <TableHead className="text-muted-foreground">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threats.map((threat) => (
                <TableRow
                  key={threat.id}
                  className="border-border hover:bg-accent/50 cursor-pointer"
                  onClick={() => setSelectedThreat(threat)}
                >
                  <TableCell className="font-medium text-card-foreground">
                    {threat.type}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={threat.severity as Severity} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono max-w-[180px] truncate">
                    {threat.source}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                        statusConfig[threat.status as ThreatStatus].className
                      )}
                    >
                      {statusConfig[threat.status as ThreatStatus].label}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {threat.relatedFindings} findings
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(threat.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Threat Detail Sheet */}
      <Sheet
        open={!!selectedThreat}
        onOpenChange={(open) => !open && setSelectedThreat(null)}
      >
        <SheetContent className="bg-card border-border sm:max-w-md overflow-y-auto">
          {selectedThreat && (
            <>
              <SheetHeader>
                <SheetTitle className="text-card-foreground">
                  {selectedThreat.type}
                </SheetTitle>
                <SheetDescription>Threat detail and recommended actions</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-5 mt-6">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={selectedThreat.severity as Severity} />
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                      statusConfig[selectedThreat.status as ThreatStatus].className
                    )}
                  >
                    {statusConfig[selectedThreat.status as ThreatStatus].label}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-card-foreground">Source</span>
                  <code className="rounded bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
                    {selectedThreat.source}
                  </code>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-card-foreground">
                    Description
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedThreat.description}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-card-foreground">
                    Recommended Action
                  </span>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="text-xs text-card-foreground leading-relaxed">
                      {selectedThreat.recommendedAction}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                  <span>Related Findings: {selectedThreat.relatedFindings}</span>
                  <span>{formatDate(selectedThreat.timestamp)}</span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
