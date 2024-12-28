import { cn } from "@/lib/utils"
import { STATUS_SIGNAL_COLORS } from "@/lib/constants"
import type { TaskPriority, TaskStatus } from "@/lib/types"

interface StatusSignalProps {
  status?: TaskStatus
  priority?: TaskPriority
  className?: string
  size?: "sm" | "md" | "lg"
}

export function StatusSignal({ status, priority, className, size = "md" }: StatusSignalProps) {
  // Determine color based on priority or status
  let color = STATUS_SIGNAL_COLORS.default

  if (status === "blocked") color = STATUS_SIGNAL_COLORS.blocked
  else if (status === "complete") color = STATUS_SIGNAL_COLORS.complete
  else if (priority === "critical") color = STATUS_SIGNAL_COLORS.critical
  else if (status === "in-progress") color = STATUS_SIGNAL_COLORS.inProgress

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn("rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)]", sizeClasses[size])}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}40`,
        }}
      />
    </div>
  )
}
