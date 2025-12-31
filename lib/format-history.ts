import type { Task, User } from "./types";

/**
 * Formats a field name for display in edit history
 */
export function formatFieldName(field: string): string {
  const fieldMap: Record<string, string> = {
    assignedTo: "Assigned To",
    title: "Title",
    description: "Description",
    priority: "Priority",
    status: "Stage",
    isFormComplete: "Form Status",
    type: "Task Type",
    dataCollectionFields: "Form Fields",
    dataCollectionData: "Form Data",
    draftData: "Draft Data",
  };

  return fieldMap[field] || field.replace(/([A-Z])/g, " $1").trim();
}

/**
 * Formats a field value for display in edit history
 */
export function formatFieldValue(
  field: string,
  value: unknown,
  users: User[],
  stages?: Array<{ id: string; name: string }>
): string {
  if (value === null || value === undefined) return "None";

  // Handle assignedTo field
  if (field === "assignedTo") {
    const user = users.find((u) => u.id === value);
    return user ? user.name : "Unassigned";
  }

  // Handle status/stage field
  if (field === "status" && stages) {
    const stage = stages.find((s) => s.id === value);
    return stage ? stage.name : String(value);
  }

  // Handle priority
  if (field === "priority") {
    return String(value).toUpperCase();
  }

  // Handle boolean values
  if (typeof value === "boolean") {
    return value ? "Complete" : "Incomplete";
  }

  // Handle arrays and objects
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return `${value.length} items`;
    }
    return JSON.stringify(value);
  }

  return String(value);
}
