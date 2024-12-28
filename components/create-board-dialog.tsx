"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"
import { useStore } from "@/lib/store"
import { DEFAULT_STAGE_COLORS } from "@/lib/constants"

interface CreateBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateBoardDialog({ open, onOpenChange }: CreateBoardDialogProps) {
  const { createBoard } = useStore()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [stages, setStages] = useState([
    { name: "To Do", color: DEFAULT_STAGE_COLORS[0] },
    { name: "In Progress", color: DEFAULT_STAGE_COLORS[1] },
    { name: "Done", color: DEFAULT_STAGE_COLORS[3] },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    createBoard(name, description, stages)
    setName("")
    setDescription("")
    setStages([
      { name: "To Do", color: DEFAULT_STAGE_COLORS[0] },
      { name: "In Progress", color: DEFAULT_STAGE_COLORS[1] },
      { name: "Done", color: DEFAULT_STAGE_COLORS[3] },
    ])
    onOpenChange(false)
  }

  const addStage = () => {
    setStages([...stages, { name: "", color: DEFAULT_STAGE_COLORS[stages.length % DEFAULT_STAGE_COLORS.length] }])
  }

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index))
  }

  const updateStage = (index: number, field: "name" | "color", value: string) => {
    setStages(stages.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>Set up a new workflow board with custom stages</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="board-name">Board Name</Label>
            <Input
              id="board-name"
              placeholder="e.g., Product Development, Marketing Campaign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-description">Description (optional)</Label>
            <Textarea
              id="board-description"
              placeholder="Brief description of this board's purpose"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Workflow Stages</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStage}>
                <Plus size={14} className="mr-1" />
                Add Stage
              </Button>
            </div>

            <div className="space-y-2">
              {stages.map((stage, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Stage ${index + 1}`}
                    value={stage.name}
                    onChange={(e) => updateStage(index, "name", e.target.value)}
                    required
                  />
                  <select
                    value={stage.color}
                    onChange={(e) => updateStage(index, "color", e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    {DEFAULT_STAGE_COLORS.map((color, i) => (
                      <option key={i} value={color}>
                        Color {i + 1}
                      </option>
                    ))}
                  </select>
                  {stages.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeStage(index)}>
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Board</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
