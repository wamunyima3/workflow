"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plus,
  Briefcase,
  ChevronRight,
  Layers,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { CreateBoardDialog } from "@/components/create-board-dialog";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { boards, selectedBoardId, selectBoard, viewMode, setViewMode } =
    useStore();
  const [createBoardOpen, setCreateBoardOpen] = useState(false);

  const handleBoardSelect = (boardId: string) => {
    selectBoard(boardId);
    if (viewMode === "executor") {
      // Stay in executor view
    } else {
      setViewMode("overseer");
    }
    // Close sidebar on mobile after selection
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay - visible only on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive width and positioning */}
      <div
        className={cn(
          "fixed md:relative md:translate-x-0 top-0 left-0 h-screen z-40",
          "w-64 border-r flex flex-col overflow-hidden",
          "bg-background transition-transform duration-300 ease-in-out",
          "md:bg-background",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with close button for mobile */}
        <div className="border-b flex items-center justify-between px-6 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
              <Layers size={20} />
            </div>
            <span className="font-bold tracking-tight">WorkFlow</span>
          </div>
          {/* Close button visible only on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider px-3 mb-2">
              Workspace
            </p>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 hover:bg-slate-800 hover:text-white transition-all",
                viewMode === "overseer" && "bg-slate-800 text-white"
              )}
              onClick={() => setViewMode("overseer")}
            >
              <LayoutDashboard size={18} />
              Board View
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 hover:bg-slate-800 hover:text-white transition-all",
                viewMode === "executor" && "bg-slate-800 text-white"
              )}
              onClick={() => setViewMode("executor")}
            >
              <Briefcase size={18} />
              Executor View
            </Button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Boards
              </p>
              <Plus
                size={14}
                className="text-slate-500 cursor-pointer hover:text-white transition-colors"
                onClick={() => setCreateBoardOpen(true)}
              />
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-1">
                {boards.map((board) => (
                  <motion.button
                    key={board.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group",
                      selectedBoardId === board.id
                        ? "bg-blue-600/10 font-medium"
                        : "hover:bg-slate-800 hover:text-white"
                    )}
                    onClick={() => handleBoardSelect(board.id)}
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        selectedBoardId === board.id
                          ? "bg-blue-400"
                          : "bg-slate-600 group-hover:bg-slate-400"
                      )}
                    />
                    <span className="truncate flex-1 text-left">
                      {board.name}
                    </span>
                    {selectedBoardId === board.id && <ChevronRight size={14} />}
                  </motion.button>
                ))}
                {boards.length === 0 && (
                  <div className="px-3 py-4 text-xs text-slate-600 italic">
                    No boards yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <CreateBoardDialog
        open={createBoardOpen}
        onOpenChange={setCreateBoardOpen}
      />
    </>
  );
}
