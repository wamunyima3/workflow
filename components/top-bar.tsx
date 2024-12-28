"use client";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, UserIcon, Check, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function TopBar({ sidebarOpen, setSidebarOpen }: TopBarProps) {
  const {
    currentUser,
    boards,
    selectedBoardId,
    viewMode,
    users,
    setCurrentUser,
    setViewMode,
  } = useStore();
  const board = boards.find((b) => b.id === selectedBoardId);

  return (
    <div className="h-16 border-b flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-foreground truncate max-w-[300px]">
          {board?.name || "System Dashboard"}
        </h2>
        <div className="h-4 w-px hidden md:block" />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:text-blue-600 relative"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </Button>
        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 ml-2 focus:outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none mb-1 text-foreground">
                  {currentUser?.name || "Guest User"}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {currentUser?.role === "overseer" ? "Overseer" : "Executor"}
                </p>
              </div>
              <Avatar className="w-9 h-9 border-2 border-primary/20">
                <AvatarImage
                  src={
                    currentUser?.avatar || currentUser?.name.split(" ")[0][0]
                  }
                />
                <AvatarFallback className="font-bold">
                  {currentUser?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "GU"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs uppercase tracking-widest">
              Switch User
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              ...new Map(
                users.map((u) => [u.email.trim().toLowerCase(), u])
              ).values(),
            ].map((u) => (
              <DropdownMenuItem
                key={u.id}
                onSelect={(e) => {
                  e.preventDefault();
                  setCurrentUser(u);
                  // Auto-switch view to match role for clarity
                  setViewMode(u.role);
                }}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <UserIcon size={14} className="text-muted-foreground" />
                  <span className="truncate">{u.name}</span>
                </span>
                {currentUser?.id === u.id && (
                  <Check size={14} className="text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
