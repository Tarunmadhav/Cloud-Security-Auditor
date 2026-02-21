import { cn } from "@/lib/utils"
import type { Severity } from "@/lib/types"

const severityConfig: Record<Severity, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-severity-critical/15 text-severity-critical border-severity-critical/30",
  },
  high: {
    label: "High",
    className: "bg-severity-high/15 text-severity-high border-severity-high/30",
  },
  medium: {
    label: "Medium",
    className: "bg-severity-medium/15 text-severity-medium border-severity-medium/30",
  },
  low: {
    label: "Low",
    className: "bg-severity-low/15 text-severity-low border-severity-low/30",
  },
  info: {
    label: "Info",
    className: "bg-severity-info/15 text-severity-info border-severity-info/30",
  },
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity
  className?: string
}) {
  const config = severityConfig[severity]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", {
          "bg-severity-critical": severity === "critical",
          "bg-severity-high": severity === "high",
          "bg-severity-medium": severity === "medium",
          "bg-severity-low": severity === "low",
          "bg-severity-info": severity === "info",
        })}
      />
      {config.label}
    </span>
  )
}
