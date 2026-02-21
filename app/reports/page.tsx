"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { reportTemplates, generatedReports as initialReports } from "@/lib/mock-data"
import {
  FileText,
  FileCode,
  ClipboardCheck,
  BookOpen,
  Download,
  Loader2,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { GeneratedReport, ReportTemplate } from "@/lib/types"

const typeIcons: Record<string, typeof FileText> = {
  executive: FileText,
  technical: FileCode,
  compliance: ClipboardCheck,
  full: BookOpen,
}

const typeColors: Record<string, string> = {
  executive: "bg-severity-info/10 text-severity-info",
  technical: "bg-severity-high/10 text-severity-high",
  compliance: "bg-severity-low/10 text-severity-low",
  full: "bg-primary/10 text-primary",
}

export default function ReportsPage() {
  const [reports, setReports] = useState<GeneratedReport[]>(initialReports)
  const [generating, setGenerating] = useState<string | null>(null)
  const [previewReport, setPreviewReport] = useState<ReportTemplate | null>(null)

  async function handleGenerate(template: ReportTemplate) {
    setGenerating(template.id)
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: template.name, type: template.type }),
      })
      const newReport = await res.json()
      setReports((prev) => [newReport, ...prev])
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate and manage security audit reports
        </p>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-3">Report Templates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reportTemplates.map((template) => {
            const Icon = typeIcons[template.type] || FileText
            const colorClass = typeColors[template.type]
            const isGenerating = generating === template.id
            return (
              <Card key={template.id} className="border-border bg-card">
                <CardContent className="flex flex-col gap-4 p-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg",
                        colorClass
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
                      {template.type}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-medium text-card-foreground">
                      {template.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  {template.lastGenerated && (
                    <span className="text-[10px] text-muted-foreground">
                      Last generated:{" "}
                      {new Date(template.lastGenerated).toLocaleDateString()}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-auto">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => handleGenerate(template)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Plus className="size-3" />
                      )}
                      {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border"
                      onClick={() => setPreviewReport(template)}
                    >
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Generated Reports */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Generated Reports ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Generated</TableHead>
                <TableHead className="text-muted-foreground">Size</TableHead>
                <TableHead className="text-muted-foreground sr-only">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const Icon = typeIcons[report.type] || FileText
                return (
                  <TableRow key={report.id} className="border-border hover:bg-accent/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-card-foreground">
                          {report.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border text-muted-foreground capitalize text-xs">
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(report.generatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {report.size}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="size-7">
                        <Download className="size-3.5" />
                        <span className="sr-only">Download report</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Preview Dialog */}
      <Dialog
        open={!!previewReport}
        onOpenChange={(open) => !open && setPreviewReport(null)}
      >
        <DialogContent className="bg-card border-border sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {previewReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">
                  {previewReport.name} Preview
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-6 mt-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <h3 className="text-sm font-semibold text-card-foreground mb-3">
                    PentestSec - {previewReport.name}
                  </h3>
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <p>Report Type: {previewReport.type}</p>
                    <p>Generated: {new Date().toLocaleString()}</p>
                    <p>Classification: CONFIDENTIAL</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold text-card-foreground">
                    1. Executive Summary
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This report presents the findings of the automated cloud security
                    audit conducted across your AWS, Azure, and GCP infrastructure.
                    A total of 16 vulnerabilities were discovered, including 4 critical
                    and 5 high-severity findings that require immediate attention.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold text-card-foreground">
                    2. Risk Assessment
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded border border-severity-critical/30 bg-severity-critical/5 p-3">
                      <span className="text-lg font-bold text-severity-critical">4</span>
                      <p className="text-[10px] text-muted-foreground">Critical Risks</p>
                    </div>
                    <div className="rounded border border-severity-high/30 bg-severity-high/5 p-3">
                      <span className="text-lg font-bold text-severity-high">5</span>
                      <p className="text-[10px] text-muted-foreground">High Risks</p>
                    </div>
                    <div className="rounded border border-severity-medium/30 bg-severity-medium/5 p-3">
                      <span className="text-lg font-bold text-severity-medium">4</span>
                      <p className="text-[10px] text-muted-foreground">Medium Risks</p>
                    </div>
                    <div className="rounded border border-severity-low/30 bg-severity-low/5 p-3">
                      <span className="text-lg font-bold text-severity-low">2</span>
                      <p className="text-[10px] text-muted-foreground">Low Risks</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold text-card-foreground">
                    3. Key Recommendations
                  </h4>
                  <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-severity-critical" />
                      Immediately remediate public S3 bucket access and Lambda function exposures
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-severity-critical" />
                      Enable MFA on root and all IAM accounts across all cloud providers
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-severity-high" />
                      Restrict security group and firewall rules to principle of least privilege
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-severity-medium" />
                      Implement comprehensive logging across all regions and providers
                    </li>
                  </ul>
                </div>

                <div className="border-t border-border pt-3 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      handleGenerate(previewReport)
                      setPreviewReport(null)
                    }}
                    disabled={!!generating}
                  >
                    Generate Full Report
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
