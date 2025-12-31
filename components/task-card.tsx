"use client"

import type { Task } from "@/lib/types"
import { TASK_PRIORITIES } from "@/lib/constants"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { History, AlertCircle, FileText, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useStore } from "@/lib/store"
import { TimeAgo } from "@/components/premium/time-ago"
import { ProgressRing } from "@/components/premium/progress-ring"

interface TaskCardProps {
  task: Task
  onClick?: (task: Task) => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { users } = useStore()
  const priorityInfo = TASK_PRIORITIES.find((p) => p.value === task.priority)

  const hasHelpRequests = task.helpRequests.some((r) => r.status === "pending")
  const isDataCollection = task.type === "data-collection"
  const hasIncompleteForm = isDataCollection && !task.isFormComplete

  // Calculate form progress if data collection task
  const formProgress = isDataCollection && task.dataCollectionFields ? 
    (Object.keys(task.dataCollectionData || {}).length / task.dataCollectionFields.length) * 100 : 0

  const assignedUser = users.find((u) => u.id === task.assignedTo)

  // Gradient overlays based on priority
  const priorityGradients = {
    critical: "from-red-500/10 via-transparent to-transparent",
    high: "from-orange-500/10 via-transparent to-transparent",
    medium: "from-blue-500/10 via-transparent to-transparent",
    low: "from-slate-500/10 via-transparent to-transparent",
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onClick?.(task)}
      className="cursor-pointer group"
    >
      <Card
        className={cn(
          "bg-card border-border shadow-md transition-all py-4 relative overflow-hidden",
          "hover:shadow-2xl hover:border-primary/50",
          task.priority === "critical" && "border-l-4 border-l-red-500 pulse-glow-critical",
          task.priority === "high" && "border-l-4 border-l-orange-500 shadow-warning",
          task.priority === "medium" && "border-l-4 border-l-blue-500",
          task.priority === "low" && "border-l-4 border-l-slate-400",
        )}
      >
        {/* Premium gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none",
          priorityGradients[task.priority as keyof typeof priorityGradients]
        )} />
        
        <CardHeader className="px-4 py-0 pb-3 space-y-2 relative z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] uppercase font-bold px-1.5 py-0.5 shadow-sm",
                  task.priority === "critical" && "bg-red-500/10 text-red-600 border-red-500/30 font-black",
                  task.priority === "high" && "bg-orange-500/10 text-orange-600 border-orange-500/30",
                  task.priority === "medium" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                  task.priority === "low" && "bg-slate-500/10 text-slate-600 border-slate-500/30",
                )}
              >
                {priorityInfo?.label}
              </Badge>
              {hasIncompleteForm && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold bg-orange-500/10 text-orange-600 border-orange-500/30 animate-pulse"
                >
                  <FileText size={10} className="mr-0.5" />
                  FORM
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {isDataCollection && formProgress > 0 && !task.isFormComplete && (
                <ProgressRing 
                  progress={formProgress} 
                  size={24} 
                  strokeWidth={3} 
                  showPercentage={false}
                  color={formProgress > 75 ? "success" : formProgress > 40 ? "warning" : "primary"}
                />
              )}
              {hasHelpRequests && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-pulse">
                  <AlertCircle size={14} />
                </div>
              )}
              {task.isFormComplete && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                  <CheckCircle2 size={14} />
                </div>
              )}
            </div>
          </div>
          <CardTitle className="text-sm font-bold text-card-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {task.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-0 pb-3 relative z-10">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
        </CardContent>
        <CardFooter className="px-4 py-0 flex items-center justify-between border-t border-border/50 pt-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <History size={11} />
              <span>{task.editHistory.length}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <Clock size={11} />
              <TimeAgo date={task.updatedAt} className="text-[10px]" />
            </div>
          </div>
          <Avatar className="w-7 h-7 border-2 border-border ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
            <AvatarFallback className="bg-gradient-primary text-[10px] font-bold">
              {assignedUser
                ? assignedUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                : "?"}
            </AvatarFallback>
          </Avatar>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

