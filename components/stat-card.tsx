import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: LucideIcon
  iconClassName?: string
  suffix?: string
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconClassName,
  suffix,
}: StatCardProps) {
  const isPositive = change >= 0

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold text-card-foreground">
              {value}
              {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
            </span>
          </div>
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              iconClassName ?? "bg-primary/10 text-primary"
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs">
          {isPositive ? (
            <ArrowUp className="size-3 text-severity-low" />
          ) : (
            <ArrowDown className="size-3 text-severity-critical" />
          )}
          <span
            className={cn(
              "font-medium",
              isPositive ? "text-severity-low" : "text-severity-critical"
            )}
          >
            {Math.abs(change)}
          </span>
          <span className="text-muted-foreground">from last period</span>
        </div>
      </CardContent>
    </Card>
  )
}
