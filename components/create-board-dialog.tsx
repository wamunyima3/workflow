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
                  <div className="relative inline-flex items-center">
                    <div
                        className="absolute left-3 w-3 h-3 rounded-full pointer-events-none"
                        style={{
                          backgroundColor: stage.color.includes('slate') ? '#94a3b8' :
                              stage.color.includes('blue') ? '#3b82f6' :
                                  stage.color.includes('purple') ? '#a855f7' :
                                      stage.color.includes('orange') ? '#fb923c' :
                                          stage.color.includes('green') ? '#10b981' : '#94a3b8'
                        }}
                    />
                    <select
                        value={stage.color}
                        onChange={(e) => updateStage(index, "color", e.target.value)}
                        className="pl-8 pr-3 py-2 border rounded-md text-sm w-32"
                    >
                      {DEFAULT_STAGE_COLORS.map((color, i) => (
                          <option
                              key={i}
                              value={color}
                              style={{
                                paddingLeft: '24px',
                                backgroundImage: `radial-gradient(circle, ${
                                    color.includes('slate') ? '#94a3b8' :
                                        color.includes('blue') ? '#3b82f6' :
                                            color.includes('purple') ? '#a855f7' :
                                                color.includes('orange') ? '#fb923c' :
                                                    color.includes('green') ? '#10b981' : '#94a3b8'
                                } 40%, transparent 40%)`,
                                backgroundSize: '12px 12px',
                                backgroundPosition: '6px center',
                                backgroundRepeat: 'no-repeat'
                              }}
                          >
                            {color.includes('slate') ? 'Gray' :
                                color.includes('blue') ? 'Blue' :
                                    color.includes('purple') ? 'Purple' :
                                        color.includes('orange') ? 'Orange' :
                                            color.includes('green') ? 'Green' : `Color ${i + 1}`}
                          </option>
                      ))}
                    </select>
                  </div>
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
