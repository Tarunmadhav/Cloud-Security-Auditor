"use client"

import { useState } from "react"
import {
  Scan,
  Bug,
  ShieldCheck,
  AlertTriangle,
  Server,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatCard } from "@/components/stat-card"
import { SeverityBadge } from "@/components/severity-badge"
import { ScanStatusBadge } from "@/components/scan-status-badge"
import { CloudProviderIcon } from "@/components/cloud-provider-icon"
import { VulnerabilityTrendChart } from "@/components/dashboard/vulnerability-trend-chart"
import { SeverityDonutChart } from "@/components/dashboard/severity-donut-chart"
import { ComplianceGauges } from "@/components/dashboard/compliance-gauges"
import {
  dashboardStats,
  scans,
  vulnerabilities,
  threats,
} from "@/lib/mock-data"
import { formatDate } from "@/lib/format-date"
import type { CloudProvider } from "@/lib/types"

export default function DashboardPage() {
  const [providerFilter, setProviderFilter] = useState<string>("all")

  const filteredVulns =
    providerFilter === "all"
      ? vulnerabilities
      : vulnerabilities.filter((v) => v.cloudProvider === providerFilter)

  const recentScans = [...scans]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5)

  const activeThreats = threats.filter((t) => t.status !== "resolved").slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Overview</h1>
          <p className="text-sm text-muted-foreground">
            Last scan: {formatDate(scans[0].startTime)}
          </p>
        </div>
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="AWS">AWS</SelectItem>
            <SelectItem value="Azure">Azure</SelectItem>
            <SelectItem value="GCP">GCP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Scans"
          value={dashboardStats.totalScans}
          change={dashboardStats.totalScansChange}
          icon={Scan}
        />
        <StatCard
          title="Active Scans"
          value={dashboardStats.activeScans}
          change={dashboardStats.activeScanChange}
          icon={Activity}
          iconClassName="bg-severity-info/10 text-severity-info"
        />
        <StatCard
          title="Critical Vulns"
          value={dashboardStats.criticalVulns}
          change={dashboardStats.criticalVulnsChange}
          icon={Bug}
          iconClassName="bg-severity-critical/10 text-severity-critical"
        />
        <StatCard
          title="Compliance"
          value={dashboardStats.complianceScore}
          suffix="%"
          change={dashboardStats.complianceChange}
          icon={ShieldCheck}
          iconClassName="bg-severity-low/10 text-severity-low"
        />
        <StatCard
          title="Threats"
          value={dashboardStats.threatsDetected}
          change={dashboardStats.threatsChange}
          icon={AlertTriangle}
          iconClassName="bg-severity-high/10 text-severity-high"
        />
        <StatCard
          title="Assets"
          value={dashboardStats.assetsMonitored.toLocaleString()}
          change={dashboardStats.assetsChange}
          icon={Server}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <VulnerabilityTrendChart />
        </div>
        <div className="lg:col-span-2">
          <SeverityDonutChart vulnerabilities={filteredVulns} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Scans */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-card-foreground truncate max-w-[180px]">
                    {scan.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <CloudProviderIcon provider={scan.cloudProvider as CloudProvider} />
                    <span className="text-[10px] text-muted-foreground">
                      {scan.findingsCount} findings
                    </span>
                  </div>
                </div>
                <ScanStatusBadge status={scan.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Compliance Gauges */}
        <ComplianceGauges />

        {/* Active Threats */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {activeThreats.map((threat) => (
              <div
                key={threat.id}
                className="flex items-start justify-between rounded-lg border border-border bg-background/50 p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-card-foreground">
                    {threat.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {threat.source}
                  </span>
                </div>
                <SeverityBadge severity={threat.severity} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
