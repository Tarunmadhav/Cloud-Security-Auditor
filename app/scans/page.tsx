"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import useSWR from "swr"
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
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ScanStatusBadge } from "@/components/scan-status-badge"
import { CloudProviderIcon } from "@/components/cloud-provider-icon"
import { NewScanDialog } from "@/components/new-scan-dialog"
import { ExternalLink, Loader2 } from "lucide-react"
import type { Scan, ScanStatus, CloudProvider } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatDuration(start: string, end: string | null): string {
  if (!end) return "In progress..."
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function ScansPage() {
  const { data: scans, isLoading, mutate } = useSWR<Scan[]>("/api/scans", fetcher, {
    refreshInterval: 5000, // poll every 5s to catch running scan progress updates
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")

  const scanList = scans ?? []

  const filtered = useMemo(() => {
    return scanList.filter((scan) => {
      if (statusFilter !== "all" && scan.status !== statusFilter) return false
      if (providerFilter !== "all" && scan.cloudProvider !== providerFilter) return false
      return true
    })
  }, [scanList, statusFilter, providerFilter])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: scanList.length }
    for (const scan of scanList) {
      counts[scan.status] = (counts[scan.status] || 0) + 1
    }
    return counts
  }, [scanList])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scan Management</h1>
          <p className="text-sm text-muted-foreground">
            {scanList.length} scans configured across all cloud providers
          </p>
        </div>
        <NewScanDialog onScanCreated={() => mutate()} />
      </div>

      {/* Status Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="running">Running ({statusCounts.running || 0})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({statusCounts.completed || 0})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({statusCounts.pending || 0})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({statusCounts.failed || 0})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={providerFilter} onValueChange={setProviderFilter}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="AWS">AWS</TabsTrigger>
            <TabsTrigger value="Azure">Azure</TabsTrigger>
            <TabsTrigger value="GCP">GCP</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scans Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Scans ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Target</TableHead>
                  <TableHead className="text-muted-foreground">Provider</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Findings</TableHead>
                  <TableHead className="text-muted-foreground">Duration</TableHead>
                  <TableHead className="text-muted-foreground sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((scan) => (
                  <TableRow key={scan.id} className="border-border hover:bg-accent/50">
                    <TableCell>
                      <Link
                        href={`/scans/${scan.id}`}
                        className="font-medium text-card-foreground hover:text-primary transition-colors"
                      >
                        {scan.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono max-w-[200px] truncate">
                      {scan.target}
                    </TableCell>
                    <TableCell>
                      <CloudProviderIcon provider={scan.cloudProvider as CloudProvider} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {scan.scanType}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <ScanStatusBadge status={scan.status as ScanStatus} />
                        {scan.status === "running" && (
                          <Progress value={scan.progress} className="h-1 w-20" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-card-foreground">{scan.findingsCount}</span>
                        {scan.criticalCount > 0 && (
                          <span className="text-severity-critical">
                            {scan.criticalCount}C
                          </span>
                        )}
                        {scan.highCount > 0 && (
                          <span className="text-severity-high">{scan.highCount}H</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDuration(scan.startTime, scan.endTime)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild className="size-7">
                        <Link href={`/scans/${scan.id}`}>
                          <ExternalLink className="size-3.5" />
                          <span className="sr-only">View scan details</span>
                        </Link>
                      </Button>
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
