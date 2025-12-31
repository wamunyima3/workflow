"use client";

import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Settings,
  AlertCircle,
  TrendingUp,
  Users,
  Trash2,
  Layers,
  UserPlus,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { ManageStagesDialog } from "@/components/manage-stages-dialog";
import { AddMembersDialog } from "@/components/add-members-dialog";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, FileSpreadsheet, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TaskType } from "@/lib/types";

export function BoardView() {
  const {
    tasks,
    selectedBoardId,
    selectTask,
    boards,
    moveTaskToStage,
    users,
    boardFilters,
    setAssigneeFilter,
    currentUser,
    deleteBoard,
    createTask,
  } = useStore();

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [manageStagesOpen, setManageStagesOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);

  // Inline creation states
  const [creatingInStage, setCreatingInStage] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<TaskType>("standard");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");

  // Editing states for board
  const [editingBoardName, setEditingBoardName] = useState(false);
  const [editingBoardDesc, setEditingBoardDesc] = useState(false);
  const [boardNameValue, setBoardNameValue] = useState("");
  const [boardDescValue, setBoardDescValue] = useState("");

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);
  const assigneeFilter = selectedBoardId
    ? boardFilters[selectedBoardId]?.assigneeFilter || "all"
    : "all";

  const boardTasks = tasks.filter((t) => t.boardId === selectedBoardId);
  const filteredBoardTasks = boardTasks.filter((t) => {
    if (assigneeFilter === "all") return true;
    if (assigneeFilter === "unassigned") return !t.assignedTo;
    return t.assignedTo === assigneeFilter;
  });

  const overseer = currentUser?.role === "overseer";

  const handleDeleteBoard = () => {
    if (selectedBoardId) {
      deleteBoard(selectedBoardId);
    }
  };

  const startEditingBoardName = () => {
    if (!overseer || !selectedBoard) return;
    setBoardNameValue(selectedBoard.name);
    setEditingBoardName(true);
  };

  const startEditingBoardDesc = () => {
    if (!overseer || !selectedBoard) return;
    setBoardDescValue(selectedBoard.description || "");
    setEditingBoardDesc(true);
  };

  const saveBoardName = () => {
    if (!selectedBoard || !boardNameValue.trim()) {
      setEditingBoardName(false);
      return;
    }

    // Update board name via store
    useStore.setState((state) => ({
      boards: state.boards.map((b) =>
        b.id === selectedBoard.id ? { ...b, name: boardNameValue.trim() } : b
      ),
    }));

    setEditingBoardName(false);
  };

  const saveBoardDesc = () => {
    if (!selectedBoard) {
      setEditingBoardDesc(false);
      return;
    }

    // Update board description via store
    useStore.setState((state) => ({
      boards: state.boards.map((b) =>
        b.id === selectedBoard.id
          ? { ...b, description: boardDescValue.trim() }
          : b
      ),
    }));

    setEditingBoardDesc(false);
  };

  const cancelBoardNameEdit = () => {
    setEditingBoardName(false);
    setBoardNameValue("");
  };

  const cancelBoardDescEdit = () => {
    setEditingBoardDesc(false);
    setBoardDescValue("");
  };

  const handleCreateInlineTask = (stageId: string) => {
    if (!newTaskTitle.trim() || !selectedBoardId) return;

    createTask({
      title: newTaskTitle.trim(),
      description: "",
      priority: "medium",
      status: stageId,
      boardId: selectedBoardId,
      type: newTaskType,
      assignedTo: newTaskAssignee || undefined,
      createdBy: currentUser?.id || "",
    });

    setNewTaskTitle("");
    setNewTaskType("standard");
    setNewTaskAssignee("");
    // Keep focus for rapid entry
  };

  if (!selectedBoard) {
    return (
      <div className="p-4 sm:p-8 h-full flex items-center justify-center">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-12 flex flex-col items-center justify-center text-center shadow-2xl max-w-2xl">
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-primary/20">
            <Layers size={32} className="sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-3 text-foreground">
            No Board Selected
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md leading-relaxed">
            Select a board from the sidebar or create a new one to start
            managing your workflow with precision and clarity.
          </p>
        </div>
      </div>
    );
  }

  const handleFilterChange = (value: string) => {
    if (selectedBoardId) {
      setAssigneeFilter(selectedBoardId, value);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      moveTaskToStage(taskId, stageId);
    }
  };

  const blockedTasks = boardTasks.filter((t) => t.blockedReason);
  const urgentTasks = boardTasks.filter(
    (t) => t.priority === "critical" || t.priority === "high"
  );
  const pendingHelp = boardTasks.filter((t) =>
    t.helpRequests.some((r) => r.status === "pending")
  );

  return (
    <>
      <div className="flex flex-col h-full bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex flex-col gap-4">
            {/* Board Title and Description Section */}
            <div className="flex-1">
              {/* Editable Board Name */}
              {editingBoardName ? (
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={boardNameValue}
                    onChange={(e) => setBoardNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveBoardName();
                      if (e.key === "Escape") cancelBoardNameEdit();
                    }}
                    className="text-lg sm:text-2xl font-bold h-9 sm:h-10"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={saveBoardName}
                    className="h-8 w-8 text-green-600 hover:bg-green-50 shrink-0"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={cancelBoardNameEdit}
                    className="h-8 w-8 text-red-600 hover:bg-red-50 shrink-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "group flex items-center gap-2 mb-2",
                    overseer && "cursor-pointer"
                  )}
                  onClick={startEditingBoardName}
                >
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight wrap-break-word">
                    {selectedBoard.name}
                  </h1>
                  {overseer && (
                    <Pencil
                      size={16}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0"
                    />
                  )}
                </div>
              )}

              {/* Editable Board Description */}
              {editingBoardDesc ? (
                <div className="flex items-start gap-2">
                  <Textarea
                    value={boardDescValue}
                    onChange={(e) => setBoardDescValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") cancelBoardDescEdit();
                    }}
                    className="text-xs sm:text-sm resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={saveBoardDesc}
                      className="h-7 w-7 text-green-600 hover:bg-green-50"
                    >
                      <Check size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={cancelBoardDescEdit}
                      className="h-7 w-7 text-red-600 hover:bg-red-50"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "group flex items-center gap-2",
                    overseer && "cursor-pointer"
                  )}
                  onClick={startEditingBoardDesc}
                >
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium wrap-break-word">
                    {selectedBoard.description || "Click to add description"}
                  </p>
                  {overseer && (
                    <Pencil
                      size={14}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0"
                    />
                  )}
                </div>
              )}

              {/* Task Stats */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {boardTasks.length}{" "}
                  {boardTasks.length === 1 ? "task" : "tasks"}
                </p>
                {urgentTasks.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold bg-orange-500/10 text-orange-500 border-orange-500/20 shrink-0"
                  >
                    <TrendingUp size={10} className="mr-1" />
                    {urgentTasks.length} URGENT
                  </Badge>
                )}
                {pendingHelp.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold bg-red-500/10 text-red-500 border-red-500/20 animate-pulse shrink-0"
                  >
                    <AlertCircle size={10} className="mr-1" />
                    {pendingHelp.length} HELP NEEDED
                  </Badge>
                )}
              </div>
            </div>

            {/* Controls Section - Stacks on mobile */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              {/* Filter and member count */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Users
                  size={16}
                  className="text-muted-foreground shrink-0"
                />
                <Select
                  value={assigneeFilter}
                  onValueChange={handleFilterChange}
                >
                  <SelectTrigger className="h-8 text-xs sm:text-sm w-full sm:w-auto sm:min-w-[180px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {(selectedBoard?.teamMembers || [])
                      .map((m) => users.find((u) => u.id === m.userId))
                      .filter(Boolean)
                      .map((u) => (
                        <SelectItem key={u!.id} value={u!.id}>
                          {u!.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Divider - hidden on mobile */}
              <div className="hidden sm:block h-8 w-px bg-border" />

              {/* Action Buttons - responsive grid */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {overseer && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground border-border bg-transparent transition-colors hover:bg-accent hover:text-accent-foreground flex-1 sm:flex-none"
                      onClick={() => setAddMembersOpen(true)}
                    >
                      <UserPlus size={14} className="shrink-0" />
                      <span className="hidden sm:inline">Add Members</span>
                      <span className="sm:hidden">Members</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground border-border bg-transparent transition-colors hover:bg-accent hover:text-accent-foreground flex-1 sm:flex-none"
                      onClick={() => setManageStagesOpen(true)}
                    >
                      <Settings size={14} className="shrink-0" />
                      <span className="hidden sm:inline">Manage Stages</span>
                      <span className="sm:hidden">Stages</span>
                    </Button>
                    <div className="hidden sm:block h-8 w-px bg-border" />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground border-border bg-transparent transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 flex-1 sm:flex-none"
                        >
                          <Trash2 size={14} className="shrink-0 text-destructive" />
                          <span className="hidden sm:inline">Delete Board</span>
                          <span className="sm:hidden">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Board</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "
                            {selectedBoard.name}
                            "? This will permanently delete the board and all{" "}
                            {boardTasks.length} associated tasks. This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteBoard}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete Board & {boardTasks.length} Tasks
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>

              {/* Create Task Button */}
              <Button
                size="sm"
                className="gap-1.5 sm:gap-2 text-xs sm:text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 w-full sm:w-auto ml-auto"
                onClick={() => setCreateTaskOpen(true)}
              >
                <Plus size={14} className="shrink-0" />
                Create
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="p-4 sm:p-6 lg:p-8 flex gap-4 sm:gap-6 min-w-max">
              {selectedBoard.stages.map((stage, stageIndex) => {
                const stageTasks = filteredBoardTasks.filter(
                  (t) => t.status === stage.id
                );

                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: stageIndex * 0.1 }}
                    className="flex flex-col gap-3 sm:gap-4 w-full sm:w-[280px] lg:w-[340px] shrink-0"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-lg shrink-0",
                            stage.color.split(" ")[0]
                          )}
                        />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
                          {stage.name}
                        </h3>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold text-muted-foreground border-border bg-accent/50 shrink-0"
                      >
                        {stageTasks.length}
                      </Badge>
                    </div>

                    <div className="space-y-2 sm:space-y-3 min-h-[200px] bg-accent/30 rounded-xl p-3 border-2 border-dashed border-border/50">
                      {stageTasks.map((task, taskIndex) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: taskIndex * 0.05 }}
                        >
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            className="cursor-move"
                            onClick={() => selectTask(task.id)}
                          >
                            <TaskCard
                              task={task}
                              onClick={(t) => selectTask(t.id)}
                            />
                          </div>
                        </motion.div>
                      ))}

                      {stageTasks.length === 0 && !creatingInStage && (
                        <div className="border-2 border-dashed border-border/50 rounded-xl h-32 flex items-center justify-center text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                          Drop tasks here
                        </div>
                      )}

                      {/* Inline Creation Form */}
                      {/* Inline Creation Form */}
                      {creatingInStage === stage.id ? (
                        <div className="bg-card p-3 rounded-xl border border-primary shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-200">
                          <Textarea
                            placeholder="What needs to be done?"
                            className="resize-none min-h-[60px] text-sm bg-background/50 focus:bg-background transition-colors"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleCreateInlineTask(stage.id);
                              }
                              if (e.key === "Escape") {
                                setCreatingInStage(null);
                                setNewTaskTitle("");
                                setNewTaskType("standard");
                                setNewTaskAssignee("");
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* Task Type Toggle */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      "h-7 w-7 p-0 rounded-full",
                                      newTaskType === "data-collection"
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-muted-foreground"
                                    )}
                                    title={
                                      newTaskType === "standard"
                                        ? "Standard Task"
                                        : "Data Collection Task"
                                    }
                                  >
                                    {newTaskType === "standard" ? (
                                      <FileText size={14} />
                                    ) : (
                                      <FileSpreadsheet size={14} />
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-48" align="start">
                                  <div className="flex flex-col p-1">
                                    <button
                                      className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors",
                                        newTaskType === "standard" &&
                                          "bg-accent text-accent-foreground"
                                      )}
                                      onClick={() => setNewTaskType("standard")}
                                    >
                                      <FileText
                                        size={14}
                                        className="text-muted-foreground"
                                      />
                                      <span>Standard Task</span>
                                    </button>
                                    <button
                                      className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors",
                                        newTaskType === "data-collection" &&
                                          "bg-accent text-accent-foreground"
                                      )}
                                      onClick={() =>
                                        setNewTaskType("data-collection")
                                      }
                                    >
                                      <FileSpreadsheet
                                        size={14}
                                        className="text-blue-500"
                                      />
                                      <span>Data Collection</span>
                                    </button>
                                  </div>
                                </PopoverContent>
                              </Popover>

                              {/* Assignee Selector */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-full"
                                    title="Assign to..."
                                  >
                                    {newTaskAssignee ? (
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={
                                            users.find(
                                              (u) => u.id === newTaskAssignee
                                            )?.avatar
                                          }
                                        />
                                        <AvatarFallback className="text-[10px]">
                                          {users
                                            .find(
                                              (u) => u.id === newTaskAssignee
                                            )
                                            ?.name.substring(0, 2)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <div className="h-6 w-6 rounded-full border border-dashed flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-solid transition-colors">
                                        <UserIcon size={12} />
                                      </div>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="p-0 w-[200px]"
                                  align="start"
                                >
                                  <Command>
                                    <CommandInput placeholder="Assign to..." />
                                    <CommandList>
                                      <CommandEmpty>No users found.</CommandEmpty>
                                      <CommandGroup heading="Team Members">
                                        <CommandItem
                                          onSelect={() => setNewTaskAssignee("")}
                                          className="gap-2"
                                        >
                                          <div className="h-6 w-6 rounded-full border border-dashed flex items-center justify-center">
                                            <UserIcon
                                              size={12}
                                              className="text-muted-foreground"
                                            />
                                          </div>
                                          <span>Unassigned</span>
                                          {newTaskAssignee === "" && (
                                            <Check size={14} className="ml-auto" />
                                          )}
                                        </CommandItem>
                                        {(selectedBoard?.teamMembers || [])
                                          .map((m) =>
                                            users.find((u) => u.id === m.userId)
                                          )
                                          .filter(Boolean)
                                          .map((user) => (
                                            <CommandItem
                                              key={user!.id}
                                              onSelect={() =>
                                                setNewTaskAssignee(user!.id)
                                              }
                                              className="gap-2"
                                            >
                                              <Avatar className="h-6 w-6">
                                                <AvatarImage src={user!.avatar} />
                                                <AvatarFallback className="text-[10px]">
                                                  {user!.name
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="truncate">
                                                {user!.name}
                                              </span>
                                              {newTaskAssignee === user!.id && (
                                                <Check
                                                  size={14}
                                                  className="ml-auto"
                                                />
                                              )}
                                            </CommandItem>
                                          ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setCreatingInStage(null);
                                  setNewTaskTitle("");
                                  setNewTaskType("standard");
                                  setNewTaskAssignee("");
                                }}
                                className="h-7 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleCreateInlineTask(stage.id)}
                                disabled={!newTaskTitle.trim()}
                                className="h-7 text-xs bg-primary hover:bg-primary/90"
                              >
                                Create
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-9 font-medium group"
                          onClick={() => {
                            setCreatingInStage(stage.id);
                            setNewTaskTitle("");
                          }}
                        >
                          <Plus
                            size={14}
                            className="group-hover:bg-accent group-hover:text-accent-foreground rounded-sm transition-colors"
                          />
                          <span className="text-xs">Create issue</span>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
      />
      <ManageStagesDialog
        open={manageStagesOpen}
        onOpenChange={setManageStagesOpen}
      />
      <AddMembersDialog
        open={addMembersOpen}
        onOpenChange={setAddMembersOpen}
        boardId={selectedBoardId || ""}
      />
    </>
  );
}
