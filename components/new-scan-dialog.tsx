"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"

interface NewScanDialogProps {
  onScanCreated?: () => void
}

export function NewScanDialog({ onScanCreated }: NewScanDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [target, setTarget] = useState("")
  const [provider, setProvider] = useState("AWS")
  const [scanType, setScanType] = useState("Full Audit")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          target,
          cloudProvider: provider,
          scanType,
        }),
      })

      setOpen(false)
      setName("")
      setTarget("")
      onScanCreated?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-3.5" />
          New Scan
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Launch New Scan</DialogTitle>
          <DialogDescription>
            Configure and launch a new security scan against your cloud infrastructure.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="scan-name" className="text-foreground">Scan Name</Label>
            <Input
              id="scan-name"
              placeholder="e.g., AWS Production Audit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background border-border"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="target" className="text-foreground">Target</Label>
            <Input
              id="target"
              placeholder="e.g., aws://account-id or azure://tenant"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
              className="bg-background border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Cloud Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AWS">AWS</SelectItem>
                  <SelectItem value="Azure">Azure</SelectItem>
                  <SelectItem value="GCP">GCP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Scan Type</Label>
              <Select value={scanType} onValueChange={setScanType}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Audit">Full Audit</SelectItem>
                  <SelectItem value="IAM Review">IAM Review</SelectItem>
                  <SelectItem value="Network Pentest">Network Pentest</SelectItem>
                  <SelectItem value="Storage Audit">Storage Audit</SelectItem>
                  <SelectItem value="Container Audit">Container Audit</SelectItem>
                  <SelectItem value="Database Audit">Database Audit</SelectItem>
                  <SelectItem value="Serverless Audit">Serverless Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-background/50 p-3">
            <Label className="text-xs font-medium text-foreground">Scan Options</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox id="deep-scan" defaultChecked />
                <label htmlFor="deep-scan" className="text-xs text-muted-foreground cursor-pointer">
                  Enable deep scanning (thorough but slower)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="compliance-check" defaultChecked />
                <label htmlFor="compliance-check" className="text-xs text-muted-foreground cursor-pointer">
                  Include compliance checks
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="threat-detect" />
                <label htmlFor="threat-detect" className="text-xs text-muted-foreground cursor-pointer">
                  Enable active threat detection
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Launching..." : "Launch Scan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
