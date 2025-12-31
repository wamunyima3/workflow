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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TopBarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function TopBar({ sidebarOpen, setSidebarOpen }: TopBarProps) {
  const { currentUser, boards, selectedBoardId, viewMode, users, setCurrentUser, setViewMode, tasks } =
    useStore();
  const board = boards.find((b) => b.id === selectedBoardId);

  // Calculate total pending help requests
  const pendingHelpRequests = tasks.reduce((count, task) => {
    return count + task.helpRequests.filter((r) => r.status === "pending").length;
  }, 0);

  return (
    <div className="h-16 border-b flex items-center justify-between px-4 md:px-6 shrink-0 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-1.5 hover:bg-accent rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-foreground truncate max-w-[200px] sm:max-w-[300px]">
          {board?.name || "System Dashboard"}
        </h2>
        <div className="h-4 w-px hidden md:block" />
      </div>

      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary relative"
            >
              <Bell size={20} />
              {pendingHelpRequests > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1 shadow-lg animate-pulse">
                  {pendingHelpRequests}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between">
              <h4 className="font-semibold text-sm">Notifications</h4>
              {pendingHelpRequests > 0 && (
                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full border">
                  {pendingHelpRequests} new
                </span>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {pendingHelpRequests > 0 ? (
                <div className="divide-y">
                  {tasks
                    .flatMap((task) =>
                      task.helpRequests
                        .filter((r) => r.status === "pending")
                        .map((request) => ({ task, request }))
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.request.requestedAt).getTime() -
                        new Date(a.request.requestedAt).getTime()
                    )
                    .map(({ task, request }) => {
                      const requester = users.find(
                        (u) => u.id === request.requestedBy
                      );
                      const priorityColor =
                        task.priority === "critical"
                          ? "bg-red-500"
                          : task.priority === "high"
                          ? "bg-orange-500"
                          : task.priority === "medium"
                          ? "bg-blue-500"
                          : "bg-slate-500";
    
                      return (
                        <button
                          key={request.id}
                          className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex gap-3 group"
                          onClick={() => useStore.getState().selectTask(task.id)}
                        >
                          <div className="shrink-0 mt-1">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                              <Bell size={14} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                                {task.title}
                              </span>
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  priorityColor
                                )}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              <span className="font-semibold text-foreground/80">
                                {requester?.name || "Unknown User"}:
                              </span>{" "}
                              "{request.message}"
                            </p>
                            <p className="text-[10px] text-muted-foreground pt-1">
                              {formatDistanceToNow(new Date(request.requestedAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Bell size={20} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No new notifications
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You're all caught up!
                  </p>
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
        <div className="h-8 w-px bg-border mx-2 hidden sm:block" />

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
