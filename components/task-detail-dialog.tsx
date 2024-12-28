"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { StatusSignal } from "@/components/status-signal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  History,
  HelpCircle,
  FileText,
  CheckCircle2,
  User,
  Clock,
  AlertTriangle,
  ChevronLeft,
  Trash2,
  Check,
  X,
  Pencil,
  Plus,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataCollectionForm } from "@/components/data-collection-form";
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
import type { DataCollectionField } from "@/lib/types";

export function TaskDetailDialog() {
  const {
    tasks,
    selectedTaskId,
    selectTask,
    acknowledgeHelpRequest,
    resolveHelpRequest,
    users,
    boards,
    updateTask,
    currentUser,
    deleteTask,
  } = useStore();

  const task = tasks.find((t) => t.id === selectedTaskId);

  // Editing states
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingForm, setEditingForm] = useState(false);

  const [titleValue, setTitleValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [priorityValue, setPriorityValue] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [formFields, setFormFields] = useState<DataCollectionField[]>([]);
  const fieldRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update refs array when fields change
  useEffect(() => {
    fieldRefs.current = fieldRefs.current.slice(0, formFields.length);
  }, [formFields.length]);

  if (!task) return null;

  const priorityInfo = TASK_PRIORITIES.find((p) => p.value === task.priority);
  const statusInfo = TASK_STATUSES.find((s) => s.value === task.status);
  const canDelete = currentUser?.role === "overseer";
  const overseer = currentUser?.role === "overseer";

  const handleDelete = () => {
    deleteTask(task.id);
    selectTask(null);
  };

  // Title editing
  const startEditingTitle = () => {
    if (!overseer) return;
    setTitleValue(task.title);
    setEditingTitle(true);
  };

  const saveTitle = () => {
    if (!titleValue.trim()) {
      setEditingTitle(false);
      return;
    }
    updateTask(task.id, { title: titleValue.trim() });
    setEditingTitle(false);
  };

  const cancelTitleEdit = () => {
    setEditingTitle(false);
    setTitleValue("");
  };

  // Description editing
  const startEditingDesc = () => {
    if (!overseer) return;
    setDescValue(task.description || "");
    setEditingDesc(true);
  };

  const saveDesc = () => {
    updateTask(task.id, { description: descValue.trim() });
    setEditingDesc(false);
  };

  const cancelDescEdit = () => {
    setEditingDesc(false);
    setDescValue("");
  };

  // Priority editing
  const startEditingPriority = () => {
    if (!overseer) return;
    setPriorityValue(task.priority);
    setEditingPriority(true);
  };

  const savePriority = () => {
    updateTask(task.id, { priority: priorityValue });
    setEditingPriority(false);
  };

  const cancelPriorityEdit = () => {
    setEditingPriority(false);
  };

  // Form editing
  const startEditingForm = () => {
    if (!overseer || task.type !== "data-collection") return;
    setFormFields(task.dataCollectionFields || []);
    setEditingForm(true);
  };

  const addFormField = () => {
    const newIndex = formFields.length;
    const newField: DataCollectionField = {
      id: `field-${Date.now()}-${formFields.length}`,
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      helpText: "",
    };
    setFormFields([...formFields, newField]);

    // Focus the new field after render
    setTimeout(() => {
      fieldRefs.current[newIndex]?.focus();
      fieldRefs.current[newIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const updateFormField = (
    index: number,
    updates: Partial<DataCollectionField>
  ) => {
    const newFields = [...formFields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormFields(newFields);
  };

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const saveForm = () => {
    updateTask(task.id, { dataCollectionFields: formFields });
    setEditingForm(false);
  };

  const cancelFormEdit = () => {
    setEditingForm(false);
    setFormFields([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border bg-card"
      >
        {/* Header Section */}
        <header className="px-8 py-6 border-b bg-card flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-3">
              <StatusSignal
                status={task.status}
                priority={task.priority}
                size="sm"
              />
            </div>

            {/* Editable Title */}
            {editingTitle ? (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") cancelTitleEdit();
                  }}
                  className="text-xl font-bold"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={saveTitle}
                  className="h-8 w-8 text-green-600 hover:bg-green-50"
                >
                  <Check size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={cancelTitleEdit}
                  className="h-8 w-8 text-red-600 hover:bg-red-50"
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  "group flex items-center gap-2 mt-2",
                  overseer && "cursor-pointer"
                )}
                onClick={startEditingTitle}
              >
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  {task.title}
                </h2>
                {overseer && (
                  <Pencil
                    size={16}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity"
                  />
                )}
              </div>
            )}

            {/* Editable Description */}
            {editingDesc ? (
              <div className="flex items-start gap-2 mt-2">
                <Textarea
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") cancelDescEdit();
                  }}
                  className="text-sm resize-none"
                  rows={2}
                  autoFocus
                />
                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={saveDesc}
                    className="h-7 w-7 text-green-600 hover:bg-green-50"
                  >
                    <Check size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={cancelDescEdit}
                    className="h-7 w-7 text-red-600 hover:bg-red-50"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "group flex items-center gap-2 mt-1",
                  overseer && "cursor-pointer"
                )}
                onClick={startEditingDesc}
              >
                <p className="text-sm text-muted-foreground font-medium max-w-xl">
                  {task.description || "Click to add description"}
                </p>
                {overseer && (
                  <Pencil
                    size={14}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity"
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 -mt-2 -mr-2">
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={18} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{task.title}"? This
                      action cannot be undone. All task data, history, and help
                      requests will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete Task
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => selectTask(null)}
              className="rounded-full"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </header>

        {/* Content Section */}
        <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
          <div className="px-8 py-2 border-b bg-muted/20">
            <TabsList className="bg-muted/50 rounded-lg p-1 h-auto gap-1">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-md px-4 py-2.5 font-semibold text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <FileText className="mr-2" size={18} />
                Details
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-md px-4 py-2.5 font-semibold text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <History className="mr-2" size={18} />
                History
                {task.editHistory.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 px-1.5 text-[10px] font-bold"
                  >
                    {task.editHistory.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="help"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-md px-4 py-2.5 font-semibold text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <HelpCircle className="mr-2" size={18} />
                Help
                {task.helpRequests.filter((r) => r.status === "pending")
                  .length > 0 && (
                  <Badge className="ml-2 h-5 px-1.5 text-[10px] font-bold bg-orange-500 hover:bg-orange-600 animate-pulse">
                    {
                      task.helpRequests.filter((r) => r.status === "pending")
                        .length
                    }
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 min-h-0">
            <TabsContent value="details" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-8 space-y-8">
                  {task.type === "data-collection" && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Data Collection Form
                        </h4>
                        {overseer && !editingForm && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={startEditingForm}
                            className="gap-2 h-7 text-xs"
                          >
                            <Pencil size={12} />
                            Edit Form
                          </Button>
                        )}
                      </div>

                      {editingForm ? (
                        <div className="space-y-4 border rounded-xl p-4 bg-muted/30">
                          <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-3 z-10 border-b border-border">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 z-10">
                              Form Fields
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addFormField}
                              className="gap-2 h-8 bg-background shadow-sm"
                            >
                              <Plus size={14} />
                              Add Field
                            </Button>
                          </div>

                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {formFields.map((field, index) => (
                              <div
                                key={field.id}
                                className="p-4 border border-slate-200 rounded-xl bg-card space-y-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 grid grid-cols-2 gap-3">
                                    <Input
                                      ref={(el) => {fieldRefs.current[index] = el;}}
                                      placeholder="Field label"
                                      value={field.label}
                                      onChange={(e) =>
                                        updateFormField(index, {
                                          label: e.target.value,
                                        })
                                      }
                                      className="bg-white"
                                    />
                                    <select
                                      value={field.type}
                                      onChange={(e) =>
                                        updateFormField(index, {
                                          type: e.target
                                            .value as DataCollectionField["type"],
                                        })
                                      }
                                      className="px-3 py-2 border rounded-md bg-white text-sm"
                                    >
                                      <option value="text">Text</option>
                                      <option value="textarea">Textarea</option>
                                      <option value="number">Number</option>
                                      <option value="email">Email</option>
                                      <option value="url">URL</option>
                                      <option value="date">Date</option>
                                      <option value="select">Select</option>
                                    </select>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFormField(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <Input
                                    placeholder="Placeholder text"
                                    value={field.placeholder || ""}
                                    onChange={(e) =>
                                      updateFormField(index, {
                                        placeholder: e.target.value,
                                      })
                                    }
                                    className="bg-white text-xs"
                                  />
                                  <Input
                                    placeholder="Help text"
                                    value={field.helpText || ""}
                                    onChange={(e) =>
                                      updateFormField(index, {
                                        helpText: e.target.value,
                                      })
                                    }
                                    className="bg-white text-xs"
                                  />
                                </div>

                                {field.type === "select" && (
                                  <Input
                                    placeholder="Options (comma-separated)"
                                    value={field.options?.join(", ") || ""}
                                    onChange={(e) =>
                                      updateFormField(index, {
                                        options: e.target.value
                                          .split(",")
                                          .map((o) => o.trim()),
                                      })
                                    }
                                    className="bg-white text-xs"
                                  />
                                )}

                                <label className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) =>
                                      updateFormField(index, {
                                        required: e.target.checked,
                                      })
                                    }
                                    className="rounded"
                                  />
                                  <span className="text-slate-600 font-medium">
                                    Required field
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center gap-2 pt-4 border-t sticky bottom-0 bg-muted/30">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addFormField}
                              className="gap-2 bg-background"
                            >
                              <Plus size={14} />
                              Add Another Field
                            </Button>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelFormEdit}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={saveForm}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Save Form
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {(() => {
                            const isOverseer = currentUser?.role === "overseer";
                            const isAssignee =
                              currentUser?.id === task.assignedTo;
                            const canEdit = Boolean(isOverseer || isAssignee);
                            return (
                              <DataCollectionForm
                                task={task}
                                readOnly={!canEdit}
                                allowComplete={canEdit}
                              />
                            );
                          })()}
                        </>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                          Metadata Summary
                        </h4>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">Priority</span>
                            {editingPriority ? (
                              <div className="flex items-center gap-2">
                                <select
                                  value={priorityValue}
                                  onChange={(e) =>
                                    setPriorityValue(
                                      e.target.value as
                                        | "low"
                                        | "medium"
                                        | "high"
                                        | "critical"
                                    )
                                  }
                                  className="px-2 py-1 border rounded text-xs"
                                  autoFocus
                                >
                                  {TASK_PRIORITIES.map((p) => (
                                    <option key={p.value} value={p.value}>
                                      {p.label}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={savePriority}
                                  className="h-6 w-6 text-green-600 hover:bg-green-50"
                                >
                                  <Check size={12} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={cancelPriorityEdit}
                                  className="h-6 w-6 text-red-600 hover:bg-red-50"
                                >
                                  <X size={12} />
                                </Button>
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "group flex items-center gap-2",
                                  overseer && "cursor-pointer"
                                )}
                                onClick={startEditingPriority}
                              >
                                <span
                                  className={cn(
                                    "font-bold uppercase",
                                    priorityInfo?.color
                                  )}
                                >
                                  {priorityInfo?.label}
                                </span>
                                {overseer && (
                                  <Pencil
                                    size={10}
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">Type</span>
                            <span className="text-slate-900 font-bold uppercase">
                              {task.type.replace("-", " ")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">Assigned To</span>
                            <div className="flex items-center gap-2 max-w-[200px]">
                              <User size={12} className="text-slate-400" />
                              {(() => {
                                const board = boards.find(
                                  (b) => b.id === task.boardId
                                );
                                let memberUsers = (board?.teamMembers || [])
                                  .map((m) =>
                                    users.find((u) => u.id === m.userId)
                                  )
                                  .filter(Boolean) as typeof users;
                                if (memberUsers.length < 2) {
                                  memberUsers = users;
                                }
                                const deduped = [
                                  ...new Map(
                                    memberUsers.map((u) => [
                                      u.email.trim().toLowerCase(),
                                      u,
                                    ])
                                  ).values(),
                                ];
                                const currentAssignee = users.find(
                                  (u) => u.id === task.assignedTo
                                );
                                const canAssign =
                                  currentUser?.role === "overseer";

                                return canAssign ? (
                                  <Select
                                    value={task.assignedTo ?? "unassigned"}
                                    onValueChange={(val) =>
                                      updateTask(task.id, {
                                        assignedTo:
                                          val === "unassigned"
                                            ? undefined
                                            : val,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="h-7 w-[180px] bg-card">
                                      <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">
                                        Unassigned
                                      </SelectItem>
                                      {deduped.map((u) => (
                                        <SelectItem key={u!.id} value={u!.id}>
                                          {u!.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="font-bold text-foreground">
                                    {currentAssignee
                                      ? currentAssignee.name
                                      : "Unassigned"}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                        Data Acquisition Status
                      </h4>
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center">
                        {task.type === "data-collection" ? (
                          <>
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                              <FileText size={24} />
                            </div>
                            <p className="text-sm font-bold text-slate-900 mb-1">
                              {
                                Object.keys(task.dataCollectionData || {})
                                  .length
                              }{" "}
                              Fields Captured
                            </p>
                            <p className="text-xs text-slate-500">
                              {task.draftData
                                ? "Uncommitted changes detected in local state."
                                : "All changes committed to master record."}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400 font-medium">
                            No data collection fields for this task type.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="history" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-8">
                  <div className="relative pl-8 space-y-8 border-l border-slate-100 ml-2">
                    {task.editHistory.length > 0 ? (
                      task.editHistory
                        .slice()
                        .reverse()
                        .map((entry) => (
                          <div key={entry.id} className="relative">
                            <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 z-10 shadow-sm">
                              <Clock size={12} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-slate-900">
                                  {entry.userName}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">
                                  {format(
                                    new Date(entry.timestamp),
                                    "MMM d, h:mm a"
                                  )}
                                </span>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
                                {entry.changes.map((change, i) => (
                                  <div key={i} className="text-xs">
                                    <span className="font-medium">
                                      Modified{" "}
                                    </span>
                                    <span className="font-bold text-slate-700">
                                      {change.field.split(".").pop()}
                                    </span>
                                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                                      <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-500 line-through">
                                        {String(change.oldValue || "none")}
                                      </span>
                                      <ChevronLeft
                                        size={10}
                                        className="text-slate-300 rotate-180"
                                      />
                                      <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-bold">
                                        {String(change.newValue || "none")}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <p className="text-xs font-bold uppercase tracking-widest">
                          No modifications recorded yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="help" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-8 space-y-6">
                  {task.helpRequests.length > 0 ? (
                    task.helpRequests.map((request) => (
                      <div
                        key={request.id}
                        className={cn(
                          "rounded-xl border p-6 space-y-4 shadow-sm transition-all",
                          request.status === "pending"
                            ? "border-orange-200 bg-orange-50/30"
                            : "border-slate-200 bg-white"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center",
                                request.status === "pending"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-green-100 text-green-600"
                              )}
                            >
                              <AlertTriangle size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Request from Executor
                              </p>
                              <p className="text-[10px] font-medium uppercase tracking-tight">
                                {format(
                                  new Date(request.requestedAt),
                                  "MMM d, h:mm a"
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold uppercase",
                              request.status === "pending"
                                ? "border-orange-200 text-orange-600 bg-orange-50"
                                : "border-green-200 text-green-600 bg-green-50"
                            )}
                          >
                            {request.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-700 italic border-l-2 border-slate-200 pl-4 py-1">
                          "{request.message}"
                        </p>

                        <div className="pt-2 flex items-center gap-3">
                          {request.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 font-bold text-[10px] uppercase h-8"
                                onClick={() =>
                                  acknowledgeHelpRequest(request.id, task.id)
                                }
                              >
                                Acknowledge
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[10px] uppercase h-8 bg-transparent"
                                onClick={() =>
                                  resolveHelpRequest(
                                    request.id,
                                    task.id,
                                    "Technical guidance provided via internal channel."
                                  )
                                }
                              >
                                Quick Resolve
                              </Button>
                            </>
                          ) : (
                            request.response && (
                              <div className="bg-green-50/50 rounded-lg p-3 border border-green-100 w-full">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle2
                                    size={12}
                                    className="text-green-600"
                                  />
                                  <span className="text-[10px] font-bold text-green-700 uppercase">
                                    Overseer Response
                                  </span>
                                </div>
                                <p className="text-xs text-green-800">
                                  {request.response}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-24 text-slate-400">
                      <HelpCircle
                        className="mx-auto mb-4 opacity-20"
                        size={48}
                      />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        No active help requests
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer section for quick actions */}
        <footer className="px-8 py-4 border-t bg-slate-50/50 flex justify-end gap-3">
          <Button
            variant="outline"
            className="text-xs font-bold uppercase h-9 border-slate-200 bg-transparent"
            onClick={() => selectTask(null)}
          >
            Close Overview
          </Button>
        </footer>
      </motion.div>
    </div>
  );
}
