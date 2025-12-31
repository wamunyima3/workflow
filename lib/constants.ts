// Storage keys for localStorage persistence
export const STORAGE_KEYS = {
  APP_STATE: "workflow-pro-app-state", // Updated app name
} as const

// Task statuses with visual hierarchy - structured as array for mapping
export const TASK_STATUSES = [
  {
    value: "todo",
    label: "To Do",
    color: "bg-slate-100 text-slate-700 border-slate-300",
  },
  {
    value: "in_progress",
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  {
    value: "in_review",
    label: "In Review",
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
  {
    value: "blocked",
    label: "Blocked",
    color: "bg-orange-100 text-orange-700 border-orange-500",
  },
  {
    value: "complete",
    label: "Complete",
    color: "bg-green-100 text-green-700 border-green-300",
  },
] as const

// Task priorities with urgency levels - structured as array for finding
export const TASK_PRIORITIES = [
  {
    value: "low",
    label: "Low",
    color: "text-slate-600",
  },
  {
    value: "medium",
    label: "Medium",
    color: "text-blue-600",
  },
  {
    value: "high",
    label: "High",
    color: "text-orange-600",
  },
  {
    value: "critical",
    label: "Critical",
    color: "text-red-600",
  },
] as const

export const DEFAULT_STAGE_COLORS = [
  "bg-slate-100 text-slate-700" as string,
  "bg-blue-100 text-blue-700" as string,
  "bg-purple-100 text-purple-700" as string,
  "bg-orange-100 text-orange-700" as string,
  "bg-green-100 text-green-700" as string,
] as const

export const DEFAULT_BOARD_STAGES = [
  { name: "To Do", color: "bg-slate-100 text-slate-700" },
  { name: "In Progress", color: "bg-blue-100 text-blue-700" },
  { name: "In Review", color: "bg-purple-100 text-purple-700" },
  { name: "Done", color: "bg-green-100 text-green-700" },
] as const

// User roles
export const USER_ROLES = {
  OVERSEER: "overseer",
  EXECUTOR: "executor",
} as const

// Status signal color mappings for visual hierarchy (pulse indicators)
export const STATUS_SIGNAL_COLORS = {
  default: "bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.4)]", // slate-400
  blocked: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]", // orange-500
  complete: "bg-green-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]", // green-500
  critical: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]", // red-500
  inProgress: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]", // blue-500
} as const;
