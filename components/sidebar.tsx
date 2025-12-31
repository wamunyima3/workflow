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
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive width and positioning */}
      <div
        className={cn(
          "fixed md:relative md:translate-x-0 top-0 left-0 h-screen z-40",
          "w-64 border-r flex flex-col overflow-hidden",
          "bg-background transition-transform duration-300 ease-in-out shadow-xl md:shadow-none",
          "md:bg-background",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with premium gradient logo */}
        <div className="border-b flex items-center justify-between px-6 h-16 shrink-0 bg-gradient-to-r from-background via-accent/30 to-background">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center font-bold shadow-primary">
              <Layers size={20} />
            </div>
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              WorkFlow
            </span>
          </div>
          {/* Close button visible only on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 hover:bg-accent rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider px-3 mb-3 text-muted-foreground">
              Workspace
            </p>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 hover:bg-primary hover:text-white transition-all rounded-lg font-medium",
                viewMode === "overseer" && "bg-primary text-white shadow-primary"
              )}
              onClick={() => setViewMode("overseer")}
            >
              <LayoutDashboard size={18} />
              Board View
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 hover:bg-primary hover:text-white transition-all rounded-lg font-medium",
                viewMode === "executor" && "bg-primary text-white shadow-primary"
              )}
              onClick={() => setViewMode("executor")}
            >
              <Briefcase size={18} />
              Executor View
            </Button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Boards ({boards.length})
              </p>
              <button
                className="p-1.5 rounded-md hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-primary"
                onClick={() => setCreateBoardOpen(true)}
              >
                <Plus size={14} />
              </button>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-1">
                {boards.map((board, idx) => (
                  <motion.button
                    key={board.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group font-medium",
                      selectedBoardId === board.id
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "hover:bg-accent hover:text-foreground"
                    )}
                    onClick={() => handleBoardSelect(board.id)}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full shadow-sm",
                        selectedBoardId === board.id
                          ? "bg-primary shadow-primary"
                          : "bg-muted-foreground/40 group-hover:bg-primary/60"
                      )}
                    />
                    <span className="truncate flex-1 text-left">
                      {board.name}
                    </span>
                    {selectedBoardId === board.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <ChevronRight size={14} className="text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
                {boards.length === 0 && (
                  <div className="px-3 py-6 text-xs text-muted-foreground italic text-center">
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
