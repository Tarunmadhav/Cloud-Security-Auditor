"use client"

import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, Clock, Target, Cloud, FileSearch, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScanStatusBadge } from "@/components/scan-status-badge"
import { SeverityBadge } from "@/components/severity-badge"
import { CloudProviderIcon } from "@/components/cloud-provider-icon"
import type { Scan, Vulnerability, CloudProvider, ScanStatus, Severity, VulnStatus } from "@/lib/types"
import { use } from "react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const vulnStatusLabel: Record<VulnStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "text-severity-critical" },
  in_progress: { label: "In Progress", className: "text-severity-medium" },
  remediated: { label: "Remediated", className: "text-severity-low" },
  accepted: { label: "Accepted", className: "text-muted-foreground" },
}

export default function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data, isLoading } = useSWR<Scan & { findings: Vulnerability[] }>(
    `/api/scans/${id}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data || data.error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h2 className="text-lg font-semibold text-foreground">Scan Not Found</h2>
        <Button variant="outline" asChild>
          <Link href="/scans">
            <ArrowLeft className="mr-2 size-4" />
            Back to Scans
          </Link>
        </Button>
      </div>
    )
  }

  const scan = data
  const findings = data.findings ?? []

  const startDate = new Date(scan.startTime)
  const endDate = scan.endTime ? new Date(scan.endTime) : null
  const duration = endDate
    ? `${Math.floor((endDate.getTime() - startDate.getTime()) / 60000)} min`
    : "In progress"

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit gap-1.5 text-muted-foreground" asChild>
          <Link href="/scans">
            <ArrowLeft className="size-3.5" />
            Back to Scans
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{scan.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{scan.target}</p>
          </div>
          <ScanStatusBadge status={scan.status as ScanStatus} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Cloud className="size-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Provider</span>
              <CloudProviderIcon
                provider={scan.cloudProvider as CloudProvider}
                showLabel
              />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-severity-info/10">
              <FileSearch className="size-4 text-severity-info" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Scan Type</span>
              <span className="text-sm font-medium text-card-foreground">
                {scan.scanType}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-severity-high/10">
              <Target className="size-4 text-severity-high" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Findings</span>
              <span className="text-sm font-medium text-card-foreground">
                {scan.findingsCount} total
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-severity-low/10">
              <Clock className="size-4 text-severity-low" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Duration</span>
              <span className="text-sm font-medium text-card-foreground">{duration}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress (if running) */}
      {scan.status === "running" && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-card-foreground">Scan Progress</span>
              <span className="text-sm font-mono text-primary">{scan.progress}%</span>
            </div>
            <Progress value={scan.progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Findings Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Findings ({findings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {findings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {scan.status === "pending"
                ? "Scan has not started yet."
                : scan.status === "running"
                  ? "Findings will appear as the scan progresses."
                  : "No findings discovered."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Vulnerability</TableHead>
                  <TableHead className="text-muted-foreground">Severity</TableHead>
                  <TableHead className="text-muted-foreground">CVSS</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Resource</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((vuln) => (
                  <TableRow key={vuln.id} className="border-border hover:bg-accent/50">
                    <TableCell className="font-medium text-card-foreground max-w-[250px]">
                      {vuln.title}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={vuln.severity as Severity} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-card-foreground">
                          {vuln.cvssScore.toFixed(1)}
                        </span>
                        <div className="h-1.5 w-12 rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-severity-critical"
                            style={{ width: `${(vuln.cvssScore / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {vuln.category}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium ${vulnStatusLabel[vuln.status as VulnStatus].className}`}
                      >
                        {vulnStatusLabel[vuln.status as VulnStatus].label}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono max-w-[180px] truncate">
                      {vuln.affectedResource}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
