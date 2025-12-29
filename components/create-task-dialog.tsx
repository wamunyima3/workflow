"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { TASK_PRIORITIES } from "@/lib/constants";
import { Plus, Trash2, FileText, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataCollectionField } from "@/lib/types";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  const { createTask, selectedBoardId, boards, users, currentUser } =
    useStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [assignedTo, setAssignedTo] = useState<string>("");

  const [taskType, setTaskType] = useState<"standard" | "data-collection">(
    "standard"
  );
  const [formFields, setFormFields] = useState<
    Omit<DataCollectionField, "id">[]
  >([]);
  const fieldRefs = useRef<(HTMLInputElement | null)[]>([]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  // Update refs array when fields change
  useEffect(() => {
    fieldRefs.current = fieldRefs.current.slice(0, formFields.length);
  }, [formFields.length]);

  const addFormField = () => {
    const newIndex = formFields.length;
    setFormFields([
      ...formFields,
      {
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        helpText: "",
      },
    ]);

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
    updates: Partial<Omit<DataCollectionField, "id">>
  ) => {
    const newFields = [...formFields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormFields(newFields);
  };

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedBoardId || !currentUser || !selectedBoard)
      return;

    const firstStage = selectedBoard.stages[0];

    const dataCollectionFields: DataCollectionField[] | undefined =
      taskType === "data-collection"
        ? formFields.map((field, i) => ({
            ...field,
            id: `field-${Date.now()}-${i}`,
          }))
        : undefined;

    createTask({
      boardId: selectedBoardId,
      title,
      description,
      type: taskType,
      priority,
      status: firstStage.id,
      createdBy: currentUser.id,
      assignedTo: assignedTo || undefined,
      dataCollectionFields,
      dataCollectionData: {},
      isFormComplete: false,
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssignedTo("");
    setTaskType("standard");
    setFormFields([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to {selectedBoard?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Task Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTaskType("standard")}
                className={cn(
                  "flex items-center gap-3 p-4 border-2 rounded-xl transition-all",
                  taskType === "standard"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <FileText size={20} />
                <div className="text-left">
                  <p className="font-bold text-sm">Standard Task</p>
                  <p className="text-xs opacity-70">Regular work item</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTaskType("data-collection")}
                className={cn(
                  "flex items-center gap-3 p-4 border-2 rounded-xl transition-all",
                  taskType === "data-collection"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <FileSpreadsheet size={20} />
                <div className="text-left">
                  <p className="font-bold text-sm">Data Collection</p>
                  <p className="text-xs opacity-70">With custom form</p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Provide details about this task"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assign To</Label>
              <select
                id="task-assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">Unassigned</option>
                {(() => {
                  const teamUsers = (selectedBoard?.teamMembers || [])
                    .map((m) => users.find((u) => u.id === m.userId))
                    .filter(Boolean) as typeof users;
                  const source = teamUsers.length > 0 ? teamUsers : users;
                  const deduped = [
                    ...new Map(
                      source.map((u) => [u.email.trim().toLowerCase(), u])
                    ).values(),
                  ];
                  return deduped.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ));
                })()}
              </select>
            </div>
          </div>

          {taskType === "data-collection" && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between sticky top-0 bg-background pb-3 z-10 border-b border-slate-100">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
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

              {formFields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                  <FileSpreadsheet
                    className="mx-auto mb-2 text-slate-300"
                    size={32}
                  />
                  <p className="text-xs text-slate-400 font-medium">
                    No form fields yet. Add fields to collect data.
                  </p>
                </div>
              )}

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {formFields.map((field, index) => (
                  <div
                    key={index}
                    className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input
                          ref={(el) => {fieldRefs.current[index] = el;}}
                          placeholder="Field label"
                          value={field.label}
                          onChange={(e) =>
                            updateFormField(index, { label: e.target.value })
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
                        <Trash2 size={16} className="text-destructive" />
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
                          updateFormField(index, { helpText: e.target.value })
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
                          updateFormField(index, { required: e.target.checked })
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

              {formFields.length > 0 && (
                <div className="flex justify-start pt-2 sticky bottom-0 bg-background pb-2 border-t border-slate-100">
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
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
