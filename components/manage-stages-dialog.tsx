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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newStages = [...stages]
    const draggedStage = newStages[draggedIndex]
    newStages.splice(draggedIndex, 1)
    newStages.splice(index, 0, draggedStage)
    
    setStages(newStages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
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
          <DialogDescription>Customize the stages for {selectedBoard.name}. Drag to reorder.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 rounded-lg bg-muted/30 border transition-all ${
                draggedIndex === index
                  ? 'opacity-50 scale-95'
                  : 'hover:shadow-md hover:border-primary/30 cursor-move'
              }`}
            >
              <GripVertical size={16} className="text-muted-foreground cursor-grab active:cursor-grabbing" />
              <Input
                value={stage.name}
                onChange={(e) => handleUpdateStage(stage.id, "name", e.target.value)}
                placeholder="Stage name"
                className="flex-1"
              />
              <div className="relative inline-flex items-center">
                <div
                  className="absolute left-3 w-3 h-3 rounded-full pointer-events-none z-10"
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
                  onChange={(e) => handleUpdateStage(stage.id, "color", e.target.value)}
                  className="pl-8 pr-3 py-2 border rounded-md text-sm w-32 bg-background"
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
                <Button variant="ghost" size="icon" onClick={() => handleRemoveStage(stage.id)} className="text-destructive hover:bg-destructive/10">
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
