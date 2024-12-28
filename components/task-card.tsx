"use client"

import type { Task } from "@/lib/types"
import { TASK_PRIORITIES } from "@/lib/constants"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { History, AlertCircle, FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useStore } from "@/lib/store"

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

  const assignedUser = users.find((u) => u.id === task.assignedTo)

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick?.(task)}
      className="cursor-pointer"
    >
      <Card
        className={cn(
          "bg-card border-border shadow-md transition-all py-4 relative overflow-hidden",
          "hover:shadow-xl hover:border-primary/50",
          task.priority === "critical" && "border-l-4 border-l-red-500 shadow-red-500/10",
          task.priority === "high" && "border-l-4 border-l-orange-500 shadow-orange-500/10",
        )}
      >
        <CardHeader className="px-4 py-0 pb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] uppercase font-bold px-1.5 py-0",
                  task.priority === "critical" && "bg-red-500/10 text-red-500 border-red-500/20",
                  task.priority === "high" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                  task.priority === "medium" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  task.priority === "low" && "bg-slate-500/10 text-slate-500 border-slate-500/20",
                )}
              >
                {priorityInfo?.label}
              </Badge>
              {hasIncompleteForm && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold bg-orange-500/10 text-orange-500 border-orange-500/20"
                >
                  <FileText size={10} className="mr-0.5" />
                  FORM
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {hasHelpRequests && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-pulse">
                  <AlertCircle size={12} />
                </div>
              )}
              {task.isFormComplete && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                  <CheckCircle2 size={12} />
                </div>
              )}
            </div>
          </div>
          <CardTitle className="text-sm font-bold text-card-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {task.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-0 pb-3">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
        </CardContent>
        <CardFooter className="px-4 py-0 flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <History size={11} />
              {task.editHistory.length}
            </div>
          </div>
          <Avatar className="w-6 h-6 border-2 border-border">
            <AvatarFallback className="bg-accent text-[10px] text-accent-foreground font-bold">
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
