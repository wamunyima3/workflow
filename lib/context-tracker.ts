/**
 * Context Tracker - Helps users resume work by tracking activity patterns
 */

import type { Task } from "./types";

export interface UserActivity {
  lastVisit: string;
  lastViewedTaskId?: string;
  lastViewedBoardId?: string;
  sessionStart: string;
}

export interface ContextInfo {
  timeAway: number; // milliseconds
  greeting: string;
  recentlyModified: Task[];
  resumeTasks: Task[];
  newAssignments: Task[];
}

/**
 * Get time-appropriate greeting
 */
export function getGreeting(userName?: string): string {
  const hour = new Date().getHours();
  const name = userName ? `, ${userName.split(" ")[0]}` : "";
  
  if (hour < 12) return `Good morning${name}`;
  if (hour < 18) return `Good afternoon${name}`;
  return `Good evening${name}`;
}

/**
 * Calculate time away from the app
 */
export function getTimeAway(lastVisit: string): number {
  return Date.now() - new Date(lastVisit).getTime();
}

/**
 * Get tasks modified while user was away
 */
export function getRecentlyModified(
  tasks: Task[],
  since: string, 
  currentUserId: string
): Task[] {
  const sinceDate = new Date(since);
  
  return tasks.filter((task) => {
    const lastEdit = task.editHistory[task.editHistory.length - 1];
    if (!lastEdit) return false;
    
    const editDate = new Date(lastEdit.timestamp);
    return editDate > sinceDate && lastEdit.userId !== currentUserId;
  }).sort((a, b) => {
    const aDate = new Date(a.editHistory[a.editHistory.length - 1].timestamp);
    const bDate = new Date(b.editHistory[b.editHistory.length - 1].timestamp);
    return bDate.getTime() - aDate.getTime();
  });
}

/**
 * Get tasks that can be resumed (have draft data or are in progress)
 */
export function getResumeTasks(tasks: Task[], currentUserId: string): Task[] {
  return tasks.filter((task) => {
    return (
      task.assignedTo === currentUserId &&
      (task.draftData || task.type === "data-collection") &&
      !task.isFormComplete
    );
  });
}

/**
 * Get newly assigned tasks
 */
export function getNewAssignments(
  tasks: Task[],
  since: string,
  currentUserId: string
): Task[] {
  const sinceDate = new Date(since);
  
  return tasks.filter((task) => {
    if (task.assignedTo !== currentUserId) return false;
    
    // Check if assigned in edit history
    const assignmentEdit = task.editHistory.find((edit) => 
      edit.changes.some((change) => 
        change.field === "assignedTo" && 
        change.newValue === currentUserId
      )
    );
    
    if (assignmentEdit) {
      return new Date(assignmentEdit.timestamp) > sinceDate;
    }
    
    // Fallback to creation date
    return new Date(task.createdAt) > sinceDate;
  });
}

/**
 * Generate context information for user
 */
export function generateContext(
  tasks: Task[],
  currentUserId: string,
  userName: string,
  lastVisit?: string
): ContextInfo {
  const since = lastVisit || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const timeAway = getTimeAway(since);
  
  return {
    timeAway,
    greeting: getGreeting(userName),
    recentlyModified: getRecentlyModified(tasks, since, currentUserId),
    resumeTasks: getResumeTasks(tasks, currentUserId),
    newAssignments: getNewAssignments(tasks, since, currentUserId),
  };
}
