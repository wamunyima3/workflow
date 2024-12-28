// Core domain types for the WorkFlow Management System
// Following Domain-Driven Design principles

export type UserRole = "overseer" | "executor"

export type TaskPriority = "low" | "medium" | "high" | "critical"

export type TaskStatus = string // Made dynamic to support custom board stages

export type TaskType = "standard" | "data-collection"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface TeamMember {
  userId: string
  joinedAt: string
}

export interface BoardStage {
  id: string
  name: string
  order: number
  color: string
}

export interface Board {
  id: string
  name: string
  description?: string
  createdBy: string // userId
  createdAt: string
  teamMembers: TeamMember[]
  stages: BoardStage[] // Added custom stages for each board
}

export interface DataCollectionField {
  id: string
  label: string
  type: "text" | "number" | "date" | "select" | "textarea" | "email" | "url"
  required: boolean
  options?: string[] // for select type
  placeholder?: string
  helpText?: string
}

export interface DataCollectionData {
  [fieldId: string]: string | number | null
}

export interface EditHistoryEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  changes: {
    field: string
    oldValue: unknown
    newValue: unknown
  }[]
}

export interface HelpRequest {
  id: string
  taskId: string
  requestedBy: string // userId
  requestedAt: string
  message: string
  status: "pending" | "acknowledged" | "resolved"
  resolvedBy?: string // userId
  resolvedAt?: string
  response?: string
}

export interface Task {
  id: string
  boardId: string
  title: string
  description: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus // Now references board stage IDs
  assignedTo?: string // userId
  createdBy: string // userId
  createdAt: string
  updatedAt: string
  dueDate?: string

  // Data collection specific fields
  dataCollectionFields?: DataCollectionField[]
  dataCollectionData?: DataCollectionData
  draftData?: DataCollectionData
  isFormComplete?: boolean

  // Edit history
  editHistory: EditHistoryEntry[]

  // Help requests
  helpRequests: HelpRequest[]

  blockedReason?: string
  tags?: string[]
}

export interface AppState {
  // Current user context
  currentUser: User | null

  // All users in the system
  users: User[]

  // Boards and tasks
  boards: Board[]
  tasks: Task[]

  // UI state
  selectedBoardId: string | null
  selectedTaskId: string | null
  viewMode: "overseer" | "executor"
}
