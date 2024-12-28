"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Users, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface AddMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
}

export function AddMembersDialog({
  open,
  onOpenChange,
  boardId,
}: AddMembersDialogProps) {
  const { boards, users, addUser, addTeamMemberToBoard } = useStore();
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"overseer" | "executor">(
    "executor"
  );

  const board = boards.find((b) => b.id === boardId);
  const boardMemberIds = board?.teamMembers.map((m) => m.userId) || [];

  // Deduplicate users by normalized email
  const deduplicatedUsers = [
    ...new Map(users.map((u) => [u.email.trim().toLowerCase(), u])).values(),
  ];

  const availableUsers = deduplicatedUsers.filter(
    (u) => !boardMemberIds.includes(u.id)
  );

  // Filter users based on search query
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddExisting = () => {
    if (selectedUserIds.length === 0) return;

    selectedUserIds.forEach((userId) => {
      addTeamMemberToBoard(boardId, userId);
    });

    setSelectedUserIds([]);
    setSearchQuery("");
  };

  const handleAddNew = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser = addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
    });

    addTeamMemberToBoard(boardId, newUser.id);

    // Reset form
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("executor");
    setMode("existing");
  };

  const currentMembers =
    board?.teamMembers
      .map((m) => users.find((u) => u.id === m.userId))
      .filter(Boolean) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Manage Team Members
          </DialogTitle>
          <DialogDescription>
            Add existing users or create new team members for{" "}
            <span className="font-semibold">{board?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Members */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
              Current Members ({currentMembers.length})
            </Label>
            <ScrollArea className="h-32 rounded-lg border border-border p-3">
              {currentMembers.length > 0 ? (
                <div className="space-y-2">
                  {currentMembers.map((member) => (
                    <div
                      key={member!.id}
                      className="flex items-center justify-between p-2 rounded-md bg-accent/50 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {member!.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {member!.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member!.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold uppercase"
                      >
                        {member!.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  No members yet
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Add Member Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === "existing" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("existing")}
                className="flex-1"
              >
                Add Existing User
              </Button>
              <Button
                type="button"
                variant={mode === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("new")}
                className="flex-1"
              >
                Create New User
              </Button>
            </div>

            {mode === "existing" ? (
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="search-users"
                    className="text-sm font-medium mb-2 block"
                  >
                    Search & Select Users
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-users"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card">
                  <ScrollArea className="h-48">
                    {filteredUsers.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {filteredUsers.map((user) => {
                          const isSelected = selectedUserIds.includes(user.id);
                          return (
                            <div
                              key={user.id}
                              onClick={() => handleToggleUser(user.id)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                                isSelected
                                  ? "bg-primary/10 border-2 border-primary"
                                  : "hover:bg-accent border-2 border-transparent"
                              )}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleToggleUser(user.id)
                                }
                                className="pointer-events-none"
                              />
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px] font-bold uppercase shrink-0"
                              >
                                {user.role}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <Users className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">
                          {searchQuery
                            ? "No users match your search"
                            : "No available users"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {searchQuery
                            ? "Try a different search term"
                            : "All users are already members"}
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {selectedUserIds.length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-sm font-medium text-foreground">
                      {selectedUserIds.length} user
                      {selectedUserIds.length !== 1 ? "s" : ""} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUserIds([])}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                )}

                <Button
                  onClick={handleAddExisting}
                  disabled={
                    selectedUserIds.length === 0 || availableUsers.length === 0
                  }
                  className="w-full"
                >
                  <UserPlus size={16} className="mr-2" />
                  Add{" "}
                  {selectedUserIds.length > 0
                    ? `${selectedUserIds.length} `
                    : ""}
                  to Board
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="new-user-name"
                    className="text-sm font-medium mb-2 block"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="new-user-name"
                    placeholder="John Doe"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="new-user-email"
                    className="text-sm font-medium mb-2 block"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="new-user-email"
                    type="email"
                    placeholder="john@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="new-user-role"
                    className="text-sm font-medium mb-2 block"
                  >
                    Role
                  </Label>
                  <Select
                    value={newUserRole}
                    onValueChange={(val) =>
                      setNewUserRole(val as "overseer" | "executor")
                    }
                  >
                    <SelectTrigger id="new-user-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executor">Executor</SelectItem>
                      <SelectItem value="overseer">Overseer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddNew}
                  disabled={!newUserName.trim() || !newUserEmail.trim()}
                  className="w-full"
                >
                  <UserPlus size={16} className="mr-2" />
                  Create & Add to Board
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
