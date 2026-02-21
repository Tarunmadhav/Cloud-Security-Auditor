import { cn } from "@/lib/utils"
import type { CloudProvider } from "@/lib/types"

const providerConfig: Record<CloudProvider, { label: string; bg: string; text: string }> = {
  AWS: { label: "AWS", bg: "bg-[oklch(0.75_0.2_55)]/15", text: "text-[oklch(0.75_0.2_55)]" },
  Azure: { label: "AZ", bg: "bg-severity-info/15", text: "text-severity-info" },
  GCP: { label: "GCP", bg: "bg-severity-low/15", text: "text-severity-low" },
}

export function CloudProviderIcon({
  provider,
  className,
  showLabel = false,
}: {
  provider: CloudProvider
  className?: string
  showLabel?: boolean
}) {
  const config = providerConfig[provider]
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold leading-none",
          config.bg,
          config.text
        )}
      >
        {config.label}
      </span>
      {showLabel && <span className="text-xs text-muted-foreground">{provider}</span>}
    </span>
  )
}
