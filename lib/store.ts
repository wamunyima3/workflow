import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AppState,
  Board,
  Task,
  User,
  EditHistoryEntry,
  HelpRequest,
  DataCollectionData,
  BoardStage,
} from "./types";
import { STORAGE_KEYS, DEFAULT_BOARD_STAGES } from "./constants";

// Helper to generate UUIDs (simple implementation)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create edit history entry helper
function createEditHistoryEntry(
  userId: string,
  userName: string,
  changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>
): EditHistoryEntry {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    userId,
    userName,
    changes,
  };
}

interface AppActions {
  // User management
  setCurrentUser: (user: User) => void;
  addUser: (user: Omit<User, "id">) => User;

  // Board management
  createBoard: (
    name: string,
    description?: string,
    stages?: { name: string; color: string }[]
  ) => Board;
  addTeamMemberToBoard: (boardId: string, userId: string) => void;
  selectBoard: (boardId: string | null) => void;
  updateBoardStages: (boardId: string, stages: BoardStage[]) => void;
  addBoardStage: (boardId: string, name: string, color: string) => void;
  removeBoardStage: (boardId: string, stageId: string) => void;
  deleteBoard: (boardId: string) => void;

  // Task management
  createTask: (
    task: Omit<
      Task,
      "id" | "createdAt" | "updatedAt" | "editHistory" | "helpRequests"
    >
  ) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  selectTask: (taskId: string | null) => void;
  moveTaskToStage: (taskId: string, stageId: string) => void;

  // Data collection draft management (temporal state preservation)
  saveDraftData: (taskId: string, data: DataCollectionData) => void;
  commitDraftData: (taskId: string) => void;
  discardDraftData: (taskId: string) => void;

  // Help request management
  createHelpRequest: (taskId: string, message: string) => void;
  acknowledgeHelpRequest: (requestId: string, taskId: string) => void;
  resolveHelpRequest: (
    requestId: string,
    taskId: string,
    response: string
  ) => void;

  // View mode
  setViewMode: (mode: "overseer" | "executor") => void;

  // Filter persistence
  setAssigneeFilter: (boardId: string, filter: string) => void;

  toggleFormComplete: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
}

// Extended AppState to include filter state
interface ExtendedAppState extends AppState {
  boardFilters: Record<string, { assigneeFilter: string }>;
}

type Store = ExtendedAppState & AppActions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      users: [],
      boards: [],
      tasks: [],
      selectedBoardId: null,
      selectedTaskId: null,
      viewMode: "overseer",
      boardFilters: {},

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),

      addUser: (userData) => {
        const normalizedEmail = userData.email.trim().toLowerCase();
        const existing = get().users.find(
          (u) => u.email.trim().toLowerCase() === normalizedEmail
        );
        if (existing) {
          return existing;
        }
        const user: User = {
          ...userData,
          id: generateId(),
        };
        set((state) => ({
          users: [...state.users, user],
        }));
        return user;
      },

      createBoard: (name, description, stages) => {
        const state = get();
        if (!state.currentUser) throw new Error("No current user");

        const boardStages: BoardStage[] = (stages || DEFAULT_BOARD_STAGES).map(
          (stage, index) => ({
            id: generateId(),
            name: stage.name,
            color: stage.color,
            order: index,
          })
        );

        const board: Board = {
          id: generateId(),
          name,
          description,
          createdBy: state.currentUser.id,
          createdAt: new Date().toISOString(),
          teamMembers: [
            {
              userId: state.currentUser.id,
              joinedAt: new Date().toISOString(),
            },
          ],
          stages: boardStages,
        };

        set((state) => ({
          boards: [...state.boards, board],
          selectedBoardId: board.id,
        }));

        return board;
      },

      addTeamMemberToBoard: (boardId, userId) => {
        set((state) => {
          const board = state.boards.find((b) => b.id === boardId);
          if (!board) return state;

          const alreadyMember = board.teamMembers.some(
            (m) => m.userId === userId
          );
          if (alreadyMember) return state;

          return {
            boards: state.boards.map((b) =>
              b.id === boardId
                ? {
                    ...b,
                    teamMembers: [
                      ...b.teamMembers,
                      { userId, joinedAt: new Date().toISOString() },
                    ],
                  }
                : b
            ),
          };
        });
      },

      selectBoard: (boardId) => set({ selectedBoardId: boardId }),

      updateBoardStages: (boardId, stages) => {
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId ? { ...b, stages } : b
          ),
        }));
      },

      addBoardStage: (boardId, name, color) => {
        set((state) => {
          const board = state.boards.find((b) => b.id === boardId);
          if (!board) return state;

          const newStage: BoardStage = {
            id: generateId(),
            name,
            color,
            order: board.stages.length,
          };

          return {
            boards: state.boards.map((b) =>
              b.id === boardId ? { ...b, stages: [...b.stages, newStage] } : b
            ),
          };
        });
      },

      removeBoardStage: (boardId, stageId) => {
        set((state) => {
          const board = state.boards.find((b) => b.id === boardId);
          if (!board) return state;

          // Move all tasks in this stage to the first stage
          const firstStage = board.stages[0];
          const updatedTasks = state.tasks.map((t) =>
            t.boardId === boardId && t.status === stageId
              ? { ...t, status: firstStage.id }
              : t
          );

          return {
            boards: state.boards.map((b) =>
              b.id === boardId
                ? {
                    ...b,
                    stages: b.stages
                      .filter((s) => s.id !== stageId)
                      .map((s, i) => ({ ...s, order: i })),
                  }
                : b
            ),
            tasks: updatedTasks,
          };
        });
      },

      createTask: (taskData) => {
        const state = get();
        if (!state.currentUser) throw new Error("No current user");

        // Find the board and get the first stage ID
        const boardId = state.selectedBoardId || taskData.boardId || "";
        const board = state.boards.find((b) => b.id === boardId);
        const initialStageId = board?.stages[0]?.id || "";

        const task: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          editHistory: [],
          helpRequests: [],
          boardId: boardId,
          status: initialStageId,
          isFormComplete: false,
        };

        set((state) => ({
          tasks: [...state.tasks, task],
        }));

        return task;
      },

      updateTask: (taskId, updates) => {
        const state = get();
        if (!state.currentUser) return;

        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task) return state;

          const changes: Array<{
            field: string;
            oldValue: unknown;
            newValue: unknown;
          }> = [];

          Object.entries(updates).forEach(([key, newValue]) => {
            const oldValue = task[key as keyof Task];
            if (
              oldValue !== newValue &&
              key !== "updatedAt" &&
              key !== "editHistory"
            ) {
              changes.push({
                field: key,
                oldValue,
                newValue,
              });
            }
          });

          return {
            tasks: state.tasks.map((t) => {
              if (t.id !== taskId) return t;

              const newEditHistory = [...t.editHistory];
              if (changes.length > 0 && state.currentUser) {
                newEditHistory.push(
                  createEditHistoryEntry(
                    state.currentUser.id,
                    state.currentUser.name,
                    changes
                  )
                );
              }

              return {
                ...t,
                ...updates,
                editHistory: newEditHistory,
                updatedAt: new Date().toISOString(),
              };
            }),
          };
        });
      },

      selectTask: (taskId) => set({ selectedTaskId: taskId }),

      moveTaskToStage: (taskId, stageId) => {
        const state = get();
        if (!state.currentUser) return;

        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task) return state;

          const changes = [
            {
              field: "status",
              oldValue: task.status,
              newValue: stageId,
            },
          ];

          return {
            tasks: state.tasks.map((t) => {
              if (t.id !== taskId) return t;

              const newEditHistory = [...t.editHistory];
              if (state.currentUser) {
                newEditHistory.push(
                  createEditHistoryEntry(
                    state.currentUser.id,
                    state.currentUser.name,
                    changes
                  )
                );
              }

              return {
                ...t,
                status: stageId,
                editHistory: newEditHistory,
                updatedAt: new Date().toISOString(),
              };
            }),
          };
        });
      },

      saveDraftData: (taskId, data) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, draftData: { ...t.draftData, ...data } }
              : t
          ),
        }));
      },

      commitDraftData: (taskId) => {
        const state = get();
        if (!state.currentUser) return;

        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task || !task.draftData) return state;

          const changes = Object.entries(task.draftData).map(
            ([fieldId, newValue]) => ({
              field: `dataCollectionData.${fieldId}`,
              oldValue: task.dataCollectionData?.[fieldId] ?? null,
              newValue,
            })
          );

          return {
            tasks: state.tasks.map((t) => {
              if (t.id !== taskId) return t;

              const newEditHistory = [...t.editHistory];
              if (changes.length > 0 && state.currentUser) {
                newEditHistory.push(
                  createEditHistoryEntry(
                    state.currentUser.id,
                    state.currentUser.name,
                    changes
                  )
                );
              }

              return {
                ...t,
                dataCollectionData: { ...t.dataCollectionData, ...t.draftData },
                draftData: undefined,
                editHistory: newEditHistory,
                updatedAt: new Date().toISOString(),
              };
            }),
          };
        });
      },

      discardDraftData: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, draftData: undefined } : t
          ),
        }));
      },

      createHelpRequest: (taskId, message) => {
        const state = get();
        if (!state.currentUser) return;

        const helpRequest: HelpRequest = {
          id: generateId(),
          taskId,
          requestedBy: state.currentUser.id,
          requestedAt: new Date().toISOString(),
          message,
          status: "pending",
        };

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, helpRequests: [...t.helpRequests, helpRequest] }
              : t
          ),
        }));
      },

      acknowledgeHelpRequest: (requestId, taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  helpRequests: t.helpRequests.map((r) =>
                    r.id === requestId ? { ...r, status: "acknowledged" } : r
                  ),
                }
              : t
          ),
        }));
      },

      resolveHelpRequest: (requestId, taskId, response) => {
        const state = get();
        if (!state.currentUser) return;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  helpRequests: t.helpRequests.map((r) =>
                    r.id === requestId
                      ? {
                          ...r,
                          status: "resolved",
                          resolvedBy: state.currentUser?.id,
                          resolvedAt: new Date().toISOString(),
                          response,
                        }
                      : r
                  ),
                }
              : t
          ),
        }));
      },

      setViewMode: (mode) => set({ viewMode: mode }),

      setAssigneeFilter: (boardId, filter) => {
        set((state) => ({
          boardFilters: {
            ...state.boardFilters,
            [boardId]: { assigneeFilter: filter },
          },
        }));
      },

      toggleFormComplete: (taskId) => {
        const state = get();
        if (!state.currentUser) return;

        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task) return state;

          const newValue = !task.isFormComplete;

          const changes = [
            {
              field: "isFormComplete",
              oldValue: task.isFormComplete || false,
              newValue: newValue,
            },
          ];

          return {
            tasks: state.tasks.map((t) => {
              if (t.id !== taskId) return t;

              const newEditHistory = [...t.editHistory];
              if (state.currentUser) {
                newEditHistory.push(
                    createEditHistoryEntry(
                        state.currentUser.id,
                        state.currentUser.name,
                        changes
                    )
                );
              }

              return {
                ...t,
                isFormComplete: newValue,
                editHistory: newEditHistory,
                updatedAt: new Date().toISOString(),
              };
            }),
          };
        });
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
          selectedTaskId:
            state.selectedTaskId === taskId ? null : state.selectedTaskId,
        }));
      },

      deleteBoard: (boardId) => {
        set((state) => ({
          // Delete all tasks associated with this board
          tasks: state.tasks.filter((t) => t.boardId !== boardId),
          // Delete the board
          boards: state.boards.filter((b) => b.id !== boardId),
          // Clear selection if this board was selected
          selectedBoardId:
            state.selectedBoardId === boardId ? null : state.selectedBoardId,
          selectedTaskId: null,
        }));
      },
    }),
    {
      name: STORAGE_KEYS.APP_STATE,
      storage: createJSONStorage(() => localStorage),
      // Explicitly persist currentUser
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        boards: state.boards,
        tasks: state.tasks,
        selectedBoardId: state.selectedBoardId,
        selectedTaskId: state.selectedTaskId,
        viewMode: state.viewMode,
        boardFilters: state.boardFilters,
      }),
    }
  )
);
