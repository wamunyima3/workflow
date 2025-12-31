"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { TASK_PRIORITIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  Layout,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { DataCollectionForm } from "@/components/data-collection-form";
import { TaskCard } from "@/components/task-card";
import { getGreeting } from "@/lib/context-tracker";

export function ExecutorView() {
  const {
    tasks,
    selectedTaskId,
    selectTask,
    currentUser,
    boards,
    moveTaskToStage,
    toggleFormComplete,
  } = useStore();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const task = tasks.find((t) => t.id === selectedTaskId);

  // Filter tasks based on user role
  const isOverseer = currentUser?.role === "overseer";
  const myTasks = isOverseer
    ? tasks // Overseers see all tasks
    : tasks.filter((t) => t.assignedTo === currentUser?.id); // Executors see only assigned tasks

  const assignedTasks = tasks.filter((t) => t.assignedTo === currentUser?.id);
  const hasBoards = boards.length > 0;
  
  // Find resumable tasks (with draft data or incomplete forms)
  const resumableTasks = tasks.filter((t) => {
    return (
      t.assignedTo === currentUser?.id &&
      ((t.draftData && Object.keys(t.draftData).length > 0) ||
        (t.type === "data-collection" && !t.isFormComplete))
    );
  });

  const getTaskBoard = (boardId: string) =>
    boards.find((b) => b.id === boardId);
  const getTaskStage = (task: { boardId: string; status: string }) => {
    const board = getTaskBoard(task.boardId);
    return board?.stages.find((s) => s.id === task.status);
  };

  // Show empty state if no boards exist
  if (!hasBoards && !task) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="px-8 py-6 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {isOverseer ? "All Tasks" : "My Work Queue"}
              </h1>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                No boards available
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center text-center shadow-2xl max-w-2xl">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <Layers size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-3 text-foreground">
              No Boards Available
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              {isOverseer
                ? "Create a board from the sidebar to start organizing your workflow and creating tasks."
                : "An overseer needs to create a board before tasks can be assigned to you."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="px-8 py-6 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
                {isOverseer ? "All Tasks" : getGreeting(currentUser?.name)}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                {isOverseer
                  ? `${myTasks.length} total tasks • Overseer View`
                  : `${assignedTasks.length} assigned tasks • Executor View`}
              </p>
            </div>
            <Button
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              onClick={() => setCreateTaskOpen(true)}
              disabled={!hasBoards}
            >
              <Plus size={16} />
              Create Task
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8">
            {myTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20">
                <div className="w-24 h-24 rounded-2xl bg-gradient-primary opacity-10 flex items-center justify-center mb-6 text-muted-foreground relative">
                  <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-xl"></div>
                  <Layout size={48} className="relative z-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {isOverseer
                    ? "No Tasks Created Yet"
                    : "No Assigned Work Items"}
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs mb-8">
                  {isOverseer
                    ? "Create tasks to begin managing your workflow"
                    : "Wait for task assignments to begin your workflow"}
                </p>
                {isOverseer && hasBoards && (
                  <Button
                    onClick={() => setCreateTaskOpen(true)}
                    className="bg-primary hover:bg-primary/90 shadow-primary"
                  >
                    <Plus size={16} className="mr-2" />
                    Create First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Continue Where You Left Off - only for executors */}
                {!isOverseer && resumableTasks.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <Clock className="text-primary" size={16} />
                        Continue Where You Left Off
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {resumableTasks.slice(0, 3).map((t) => {
                        const stage = getTaskStage(t);
                        const board = getTaskBoard(t.boardId);
                        const priorityInfo = TASK_PRIORITIES.find(
                          (p) => p.value === t.priority
                        );

                        return (
                          <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => selectTask(t.id)}
                            className="relative"
                          >
                            <div className="absolute -inset-0.5 bg-gradient-primary opacity-20 blur rounded-xl"></div>
                            <TaskCard task={t} onClick={(t) => selectTask(t.id)} />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Tasks */}
                <div className="space-y-4">
                  {(!isOverseer && resumableTasks.length > 0) && (
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        All Your Tasks
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myTasks.map((t, idx) => {
                      const stage = getTaskStage(t);
                      const board = getTaskBoard(t.boardId);
                      const priorityInfo = TASK_PRIORITIES.find(
                        (p) => p.value === t.priority
                      );

                      const hasHelpRequest = t.helpRequests.some(
                        (r) => r.status === "pending"
                      );
                      const isDataCollection = t.type === "data-collection";
                      const hasIncompleteForm =
                        isDataCollection && !t.isFormComplete;

                      return (
                        <motion.div
                          key={t.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <TaskCard task={t} onClick={(t) => selectTask(t.id)} />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <CreateTaskDialog
          open={createTaskOpen}
          onOpenChange={setCreateTaskOpen}
        />
      </div>
    );
  }

  const board = getTaskBoard(task.boardId);
  const currentStage = getTaskStage(task);
  const priorityInfo = TASK_PRIORITIES.find((p) => p.value === task.priority);
  const isDataCollection = task.type === "data-collection";

  return (
    <>
      <div className="h-full flex flex-col bg-background overflow-hidden">
        <header className="px-8 py-6 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectTask(null)}
                className="text-muted-foreground hover:text-primary gap-1 px-2 hover:bg-accent"
              >
                <ChevronLeft size={16} />
                Back
              </Button>
              <div className="h-4 w-px bg-border" />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-foreground tracking-tight">
                    {task.title}
                  </h1>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold uppercase",
                      task.priority === "critical" &&
                        "bg-red-500/10 text-red-500 border-red-500/20",
                      task.priority === "high" &&
                        "bg-orange-500/10 text-orange-500 border-orange-500/20",
                      task.priority === "medium" &&
                        "bg-blue-500/10 text-blue-500 border-blue-500/20",
                      task.priority === "low" &&
                        "bg-slate-500/10 text-slate-500 border-slate-500/20"
                    )}
                    variant="outline"
                  >
                    {task.priority}
                  </Badge>
                  {currentStage && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold",
                        currentStage.color
                      )}
                    >
                      {currentStage.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {board?.name}
                </p>
              </div>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="max-w-6xl mx-auto p-8 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
              <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">
                Task Brief
              </h3>
              <p className="text-sm text-card-foreground leading-relaxed">
                {task.description}
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
              <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">
                Progress Controls
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {board?.stages.map((stage) => (
                  <Button
                    key={stage.id}
                    variant={
                      currentStage?.id === stage.id ? "default" : "outline"
                    }
                    className={cn(
                      "w-full font-bold text-xs transition-all",
                      currentStage?.id === stage.id
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-transparent border-border hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => moveTaskToStage(task.id, stage.id)}
                  >
                    {stage.name}
                  </Button>
                ))}
              </div>
            </div>

            {isDataCollection && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Data Acquisition Form
                  </h3>
                  {task.isFormComplete && (
                    <Badge
                      className="bg-green-500/10 text-green-500 border-green-500/20 font-bold"
                      variant="outline"
                    >
                      <CheckCircle2 size={12} className="mr-1" />
                      Submitted
                    </Badge>
                  )}
                </div>
                {(() => {
                  const isOverseer = currentUser?.role === "overseer";
                  const isAssignee = currentUser?.id === task.assignedTo;
                  const canEdit = Boolean(isOverseer || isAssignee);
                  return (
                    <DataCollectionForm
                      task={task}
                      readOnly={!canEdit}
                      allowComplete={canEdit}
                    />
                  );
                })()}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
