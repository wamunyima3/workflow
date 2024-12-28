"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { useAutoSave } from "@/hooks/use-auto-save"
import type { Task, DataCollectionData } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, CheckCircle2, RotateCcw, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface DataCollectionFormProps {
  task: Task
  readOnly?: boolean
  allowComplete?: boolean
}

export function DataCollectionForm({ task, readOnly = false, allowComplete = false }: DataCollectionFormProps) {
  const { saveDraftData, commitDraftData, discardDraftData, markFormComplete } = useStore()

  // Local state initialized from task's current data or draft
  const [formData, setFormData] = useState<DataCollectionData>(task.draftData || task.dataCollectionData || {})
  const [isSaved, setIsSaved] = useState(false)

  // Use the auto-save hook to preserve state in Zustand/LocalStorage
  useAutoSave(formData, (data) => {
    saveDraftData(task.id, data)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  })

  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleCommit = () => {
    commitDraftData(task.id)
  }

  const handleDiscard = () => {
    discardDraftData(task.id)
    setFormData(task.dataCollectionData || {})
  }

  return (
    <Card className="border-slate-200 shadow-xl overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold text-slate-900">Data Acquisition Terminal</CardTitle>
            {task.draftData && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-bold text-[10px]">
                DRAFT RESTORED
              </Badge>
            )}
          </div>
          <AnimatePresence>
            {isSaved && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-green-600 text-xs font-bold"
              >
                <CheckCircle2 size={14} />
                STATE PRESERVED
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {task.dataCollectionFields?.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                value={(formData[field.id] as string) || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                className="min-h-[120px] bg-accent/30 border-border focus-visible:ring-primary"
                disabled={readOnly || task.isFormComplete}
              />
            ) : (
              <Input
                type={field.type}
                value={(formData[field.id] as string) || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                className="bg-accent/30 border-border h-11 focus-visible:ring-primary"
                disabled={readOnly || task.isFormComplete}
              />
            )}
          </div>
        ))}

        {!task.dataCollectionFields?.length && (
          <div className="text-center py-12 text-slate-400">
            <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
            <p className="text-sm font-medium uppercase tracking-widest">No fields defined for this task</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-accent/30 border-t px-8 py-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-accent font-bold text-xs uppercase bg-transparent"
            onClick={handleDiscard}
            disabled={!task.draftData || readOnly || task.isFormComplete}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Discard Draft
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold text-xs uppercase px-8"
            onClick={handleCommit}
            disabled={!task.draftData || readOnly || task.isFormComplete}
          >
            <Save className="mr-2 h-3.5 w-3.5" />
            Save
          </Button>
          {allowComplete && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase px-6"
              onClick={() => {
                // Ensure any current draft is committed first
                if (task.draftData) {
                  commitDraftData(task.id)
                }
                markFormComplete(task.id)
              }}
              disabled={task.isFormComplete}
            >
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
              Mark Complete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
