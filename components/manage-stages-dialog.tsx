"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, GripVertical } from "lucide-react"
import { useStore } from "@/lib/store"
import { DEFAULT_STAGE_COLORS } from "@/lib/constants"
import type { BoardStage } from "@/lib/types"

interface ManageStagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageStagesDialog({ open, onOpenChange }: ManageStagesDialogProps) {
  const { selectedBoardId, boards, updateBoardStages, addBoardStage, removeBoardStage } = useStore()
  const selectedBoard = boards.find((b) => b.id === selectedBoardId)
  const [stages, setStages] = useState<BoardStage[]>([])

  useEffect(() => {
    if (selectedBoard) {
      setStages([...selectedBoard.stages])
    }
  }, [selectedBoard, open])

  const handleAddStage = () => {
    if (!selectedBoardId) return
    const newStageName = `Stage ${stages.length + 1}`
    const newColor = DEFAULT_STAGE_COLORS[stages.length % DEFAULT_STAGE_COLORS.length]
    addBoardStage(selectedBoardId, newStageName, newColor)
  }

  const handleRemoveStage = (stageId: string) => {
    if (!selectedBoardId || stages.length <= 2) return
    if (confirm("Remove this stage? All tasks in this stage will move to the first stage.")) {
      removeBoardStage(selectedBoardId, stageId)
    }
  }

  const handleUpdateStage = (stageId: string, field: "name" | "color", value: string) => {
    setStages(stages.map((s) => (s.id === stageId ? { ...s, [field]: value } : s)))
  }

  const handleSave = () => {
    if (!selectedBoardId) return
    updateBoardStages(selectedBoardId, stages)
    onOpenChange(false)
  }

  if (!selectedBoard) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Workflow Stages</DialogTitle>
          <DialogDescription>Customize the stages for {selectedBoard.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-3 p-3 rounded-lg">
              <GripVertical size={16} className="" />
              <Input
                value={stage.name}
                onChange={(e) => handleUpdateStage(stage.id, "name", e.target.value)}
                placeholder="Stage name"
              />
              <select
                value={stage.color}
                onChange={(e) => handleUpdateStage(stage.id, "color", e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {DEFAULT_STAGE_COLORS.map((color, i) => (
                  <option key={i} value={color}>
                    Color {i + 1}
                  </option>
                ))}
              </select>
              {stages.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => handleRemoveStage(stage.id)}>
                  <X size={16} />
                </Button>
              )}
            </div>
          ))}

          <Button variant="outline" className="w-full bg-transparent" onClick={handleAddStage}>
            <Plus size={14} className="mr-2" />
            Add Stage
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
