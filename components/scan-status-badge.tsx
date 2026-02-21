import { cn } from "@/lib/utils"
import type { ScanStatus } from "@/lib/types"

const statusConfig: Record<ScanStatus, { label: string; className: string; dot: string }> = {
  completed: {
    label: "Completed",
    className: "bg-severity-low/15 text-severity-low border-severity-low/30",
    dot: "bg-severity-low",
  },
  running: {
    label: "Running",
    className: "bg-severity-info/15 text-severity-info border-severity-info/30",
    dot: "bg-severity-info",
  },
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  failed: {
    label: "Failed",
    className: "bg-severity-critical/15 text-severity-critical border-severity-critical/30",
    dot: "bg-severity-critical",
  },
}

export function ScanStatusBadge({
  status,
  className,
}: {
  status: ScanStatus
  className?: string
}) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <span className="relative flex size-1.5">
        {status === "running" && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              config.dot
            )}
          />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", config.dot)} />
      </span>
      {config.label}
    </span>
  )
}
