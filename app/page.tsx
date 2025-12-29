"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { BoardView } from "@/components/boardview";
import { ExecutorView } from "@/components/executor-view";
import { TaskDetailDialog } from "@/components/task-detail-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Layers } from "lucide-react";

export default function App() {
  const {
    currentUser,
    setCurrentUser,
    addUser,
    boards,
    users,
    createBoard,
    addTeamMemberToBoard,
    viewMode,
    selectedBoardId,
    createTask,
  } = useStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Wait for store to hydrate from localStorage before initializing
  useEffect(() => {
    // Give zustand persist time to hydrate
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Initialize demo data only after hydration and if system is truly empty
  useEffect(() => {
    if (!isInitialized) return;

    // Only initialize if there are NO users at all (fresh start)
    if (users.length === 0) {
      const overseerUser = {
        name: "Wamunyima Mukelabai",
        email: "wamunyima@workflow.app",
        role: "overseer" as const,
      };
      const user = addUser(overseerUser);
      setCurrentUser(user);

      // Add executor users
      addUser({
        name: "Mike Zambia",
        email: "mike@workflow.app",
        role: "executor" as const,
      });

      addUser({
        name: "Open Challenge",
        email: "challenge@workflow.app",
        role: "executor" as const,
      });
    } else if (!currentUser && users.length > 0) {
      // If we have users but no current user selected, select the first one
      setCurrentUser(users[0]);
    }
  }, [
    isInitialized,
    users.length,
    currentUser,
    addUser,
    setCurrentUser,
    users,
  ]);

  useEffect(() => {
    if (!isInitialized) return;

    if (currentUser && boards.length === 0) {
      const newBoard = createBoard(
        "Q1 Product Launch",
        "Main board for Q1 product features and launch preparations",
        [
          { name: "Backlog", color: "bg-slate-500" },
          { name: "In Progress", color: "bg-blue-500" },
          { name: "Review", color: "bg-purple-500" },
          { name: "Testing", color: "bg-orange-500" },
          { name: "Done", color: "bg-green-500" },
        ]
      );

      // Ensure all existing users are members of the initial board
      users.forEach((u) => addTeamMemberToBoard(newBoard.id, u.id));

      // Ensure all existing users are members of the initial board
      users.forEach((u) => addTeamMemberToBoard(newBoard.id, u.id));

      // Create a demo census data collection task
      if (currentUser) {
        createTask({
          title: "National Census Data Collection - District 7",
          description: "Collect household census data for District 7, Zone A. Ensure all required fields are completed accurately and verified before submission.",
          type: "data-collection",
          priority: "high",
          boardId: newBoard.id,
          // assignedTo: currentUser.id,
          dataCollectionFields: [
            {
              id: "household-id",
              label: "Household ID",
              type: "text",
              required: true,
              placeholder: "e.g., D7-ZA-001",
              helpText: "Unique identifier for this household",
            },
            {
              id: "head-of-household",
              label: "Head of Household Name",
              type: "text",
              required: true,
              placeholder: "Full name",
              helpText: "Legal name of the household head",
            },
            {
              id: "household-size",
              label: "Number of Household Members",
              type: "number",
              required: true,
              placeholder: "0",
              helpText: "Total number of people living in this household",
            },
            {
              id: "dwelling-type",
              label: "Type of Dwelling",
              type: "select",
              required: true,
              options: [
                "Single Family House",
                "Apartment",
                "Townhouse",
                "Mobile Home",
                "Other",
              ],
              helpText: "Select the type of dwelling",
            },
            {
              id: "electricity-access",
              label: "Access to Electricity",
              type: "select",
              required: true,
              options: ["Yes - Grid", "Yes - Solar", "Yes - Generator", "No"],
              helpText: "Primary source of electricity",
            },
            {
              id: "water-source",
              label: "Primary Water Source",
              type: "select",
              required: true,
              options: [
                "Piped into dwelling",
                "Public tap",
                "Borehole",
                "Well",
                "River/Stream",
                "Other",
              ],
              helpText: "Main source of drinking water",
            },
            {
              id: "monthly-income",
              label: "Estimated Monthly Household Income (ZMW)",
              type: "select",
              required: false,
              options: [
                "Below 1,000",
                "1,000 - 3,000",
                "3,000 - 5,000",
                "5,000 - 10,000",
                "Above 10,000",
              ],
              helpText: "Approximate total household income",
            },
            {
              id: "children-under-5",
              label: "Number of Children Under 5",
              type: "number",
              required: true,
              placeholder: "0",
              helpText: "Children under 5 years of age in household",
            },
            {
              id: "school-age-children",
              label: "Number of School-Age Children (5-18)",
              type: "number",
              required: true,
              placeholder: "0",
              helpText: "Children between 5 and 18 years old",
            },
            {
              id: "contact-number",
              label: "Contact Phone Number",
              type: "text",
              required: false,
              placeholder: "+260...",
              helpText: "Optional contact number for follow-up",
            },
            {
              id: "gps-coordinates",
              label: "GPS Coordinates",
              type: "text",
              required: false,
              placeholder: "Latitude, Longitude",
              helpText: "Location coordinates if available",
            },
            {
              id: "additional-notes",
              label: "Additional Notes",
              type: "textarea",
              required: false,
              placeholder: "Any additional observations or notes...",
              helpText: "Special circumstances or observations about this household",
            },
          ],
          status: `${newBoard.stages.at(0)}`,
          createdBy: currentUser.id
        });
      }
    }
  }, [
    isInitialized,
    currentUser,
    boards.length,
    createBoard,
    users,
    addTeamMemberToBoard,
    createTask,
  ]);

  // Show loading state while hydrating
  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-background relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode + (selectedBoardId || "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {viewMode === "overseer" && selectedBoardId ? (
                <BoardView />
              ) : viewMode === "executor" ? (
                <ExecutorView />
              ) : (
                <div className="p-8 h-full flex items-center justify-center">
                  <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center text-center shadow-2xl max-w-2xl">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                      <Layers size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-3 text-foreground">
                      Welcome to WorkFlow
                    </h1>
                    <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
                      Select a board from the sidebar or create a new one to
                      start managing your workflow with precision and clarity.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <TaskDetailDialog />
        </main>
      </div>
    </div>
  );
}
