"use client"

import { useState, useMemo } from "react"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { SeverityBadge } from "@/components/severity-badge"
import { CloudProviderIcon } from "@/components/cloud-provider-icon"
import { vulnerabilities } from "@/lib/mock-data"
import { ChevronDown, Bug } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Severity, CloudProvider, VulnStatus } from "@/lib/types"

const vulnStatusConfig: Record<VulnStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-severity-critical/15 text-severity-critical border-severity-critical/30" },
  in_progress: { label: "In Progress", className: "bg-severity-medium/15 text-severity-medium border-severity-medium/30" },
  remediated: { label: "Remediated", className: "bg-severity-low/15 text-severity-low border-severity-low/30" },
  accepted: { label: "Accepted", className: "bg-muted text-muted-foreground border-border" },
}

export default function VulnerabilitiesPage() {
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return vulnerabilities.filter((v) => {
      if (severityFilter !== "all" && v.severity !== severityFilter) return false
      if (statusFilter !== "all" && v.status !== statusFilter) return false
      return true
    })
  }, [severityFilter, statusFilter])

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const v of vulnerabilities) {
      counts[v.severity] = (counts[v.severity] || 0) + 1
    }
    return counts
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Vulnerabilities</h1>
          <Badge variant="secondary" className="bg-severity-critical/15 text-severity-critical border-severity-critical/30">
            {vulnerabilities.length} total
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          All discovered vulnerabilities across your cloud infrastructure
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {(["critical", "high", "medium", "low", "info"] as Severity[]).map((sev) => (
          <Card
            key={sev}
            className={cn(
              "border-border bg-card cursor-pointer transition-colors",
              severityFilter === sev && "ring-1 ring-primary"
            )}
            onClick={() => setSeverityFilter(severityFilter === sev ? "all" : sev)}
          >
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground capitalize">{sev}</span>
                <span className="text-xl font-bold text-card-foreground">
                  {severityCounts[sev] || 0}
                </span>
              </div>
              <Bug
                className={cn("size-5", {
                  "text-severity-critical": sev === "critical",
                  "text-severity-high": sev === "high",
                  "text-severity-medium": sev === "medium",
                  "text-severity-low": sev === "low",
                  "text-severity-info": sev === "info",
                })}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="remediated">Remediated</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            {filtered.length} vulnerabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-8 text-muted-foreground" />
                <TableHead className="text-muted-foreground">Title</TableHead>
                <TableHead className="text-muted-foreground">Severity</TableHead>
                <TableHead className="text-muted-foreground">CVSS</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Provider</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((vuln) => (
                <Collapsible
                  key={vuln.id}
                  open={expandedId === vuln.id}
                  onOpenChange={(open) => setExpandedId(open ? vuln.id : null)}
                  asChild
                >
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="border-border hover:bg-accent/50 cursor-pointer">
                        <TableCell>
                          <ChevronDown
                            className={cn(
                              "size-3.5 text-muted-foreground transition-transform",
                              expandedId === vuln.id && "rotate-180"
                            )}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-card-foreground max-w-[280px] truncate">
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
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${(vuln.cvssScore / 10) * 100}%`,
                                  backgroundColor:
                                    vuln.cvssScore >= 9
                                      ? "oklch(0.65 0.25 25)"
                                      : vuln.cvssScore >= 7
                                        ? "oklch(0.75 0.2 55)"
                                        : vuln.cvssScore >= 4
                                          ? "oklch(0.85 0.18 85)"
                                          : "oklch(0.75 0.18 155)",
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {vuln.category}
                        </TableCell>
                        <TableCell>
                          <CloudProviderIcon provider={vuln.cloudProvider as CloudProvider} />
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                              vulnStatusConfig[vuln.status as VulnStatus].className
                            )}
                          >
                            {vulnStatusConfig[vuln.status as VulnStatus].label}
                          </span>
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow className="border-border bg-accent/30 hover:bg-accent/30">
                        <TableCell colSpan={7}>
                          <div className="flex flex-col gap-4 py-2">
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-card-foreground">
                                  Description
                                </span>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {vuln.description}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-card-foreground">
                                  Remediation
                                </span>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {vuln.remediation}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                Resource:{" "}
                                <code className="font-mono text-card-foreground">
                                  {vuln.affectedResource}
                                </code>
                              </span>
                              <span>
                                Discovered:{" "}
                                {new Date(vuln.discoveredAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
