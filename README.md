# WorkFlow – Guided Work Environment for Structured Processes

A professional task management system designed to support two distinct user contexts: **Overseers** (supervisors managing multiple work streams) and **Executors** (individual contributors focused on task completion). Built with Next.js, React, TypeScript, and Zustand.

**[Live Demo](https://openchallengeworkflow.vercel.app)** | **[GitHub Repository](https://github.com/wamunyima3/workflow)**

---

## UX Rationale

### Design Philosophy
WorkFlow prioritizes **clarity, continuity, and decision support** over visual density. The interface helps users regain context after interruption and make confident decisions under pressure by:

1. **Clear Work Visibility**
   - Task cards display priority, status, assignee, and blockers at a glance
   - Visual signals (status indicators, form badges, help request alerts) highlight what requires attention
   - Board stages provide a natural workflow progression without cognitive load

2. **Resumption & Context**
   - Edit history shows all changes with timestamps and responsible users
   - Draft preservation auto-saves data collection work, allowing seamless resumption
   - Task detail view surfaces blockers, help requests, and recent modifications
   - Current user always visible in top bar for quick role verification

3. **Dual Operating Contexts**
   - **Overseer Board View**: Kanban-style columns show task flow across stages; filters and team management enable oversight without micromanagement
   - **Executor Work Queue**: Personalized task list emphasizes assigned work; progress controls and form guidance support focused execution
   - Shared component architecture prevents code duplication while enabling context-specific interactions

4. **Decision Support**
   - Priority badges (critical, high, medium, low) guide urgency perception
   - Help request system surfaces blockers and enables async communication
   - Form completion status flags data collection tasks awaiting submission
   - Task metadata (assignee, board, stage) provides sufficient context for handoff decisions

### Key UX Decisions
- **Mobile-first responsive design**: Sidebar collapses on mobile; touch-friendly buttons and spacing
- **Smooth state transitions**: Framer Motion animations reduce jarring updates during task movement or view switching
- **Persistent state**: Zustand + localStorage preserve boards, tasks, and user selection across sessions
- **Progressive disclosure**: Task detail dialog opens on demand, keeping the main view focused and uncluttered

---

## Features

### Core Functionality
- ✅ **Dual Role System**: Switch between Overseer and Executor contexts instantly
- ✅ **Custom Board Stages**: Create boards with custom workflow stages (Backlog → Done, etc.)
- ✅ **Task Management**: Create, edit, move, and delete tasks with rich metadata
- ✅ **Priority & Status**: Classify tasks by urgency (Critical, High, Medium, Low) and current stage
- ✅ **Edit History**: Full audit trail showing who changed what, when, and why
- ✅ **Help Request System**: Executors request help; overseers acknowledge and resolve with async communication
- ✅ **Data Collection Forms**: Define custom forms for tasks requiring structured data input with auto-save drafts
- ✅ **Team Management**: Add existing users or create new team members; assign to boards
- ✅ **Responsive Design**: Mobile-optimized with collapsible sidebar and touch-friendly interactions

### Advanced Features
- 📊 **Visual Task Signals**: Status indicators (pulse animations) show priority and blockers at a glance
- 💾 **Draft Preservation**: Auto-save form data prevents loss during task resumption
- 📝 **Rich Task Detail**: Expandable task modal with tabs for details, history, and help requests
- 🔄 **State Persistence**: All data saved to localStorage; app state survives browser refresh
- ⌨️ **Keyboard Navigation**: Support for Enter/Escape in forms; intuitive focus management

---

## Getting Started

### Prerequisites
- Node.js 18+ (Next.js 16 compatible)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/workflow.git
   cd workflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Data
The app ships with demo users and a sample board pre-configured:

**Demo Users:**
- **Wamunyima Mukelabai** (Overseer) – Full board and task management authority
- **Mike Zambia** (Executor) – Focused on assigned task execution
- **Open Challenge** (Executor) – Additional executor for testing team workflows

**Demo Board:**
- **Q1 Product Launch** – Sample board with custom stages (Backlog → In Progress → Review → Testing → Done)

Switch between users using the user dropdown in the top-right corner. Try both Overseer and Executor views to see how the interface adapts to different responsibilities.

---

## How to Use

### For Overseers
1. **Create a Board**: Click the `+` icon in the sidebar under "Boards" → Set name, description, and workflow stages
2. **Add Team Members**: Use the team icon in the top bar to add existing users or create new team members
3. **Create Tasks**: Click "Create Task" → Define title, description, priority, and task type (standard or data-collection)
4. **Manage Task Flow**: Drag tasks between board columns or use the detail modal to move tasks to specific stages
5. **Monitor Blockers**: The Help tab in task details shows pending help requests from executors
6. **Review History**: Edit History tab tracks all changes for accountability and context restoration

### For Executors
1. **View Assigned Work**: "My Work Queue" shows all tasks assigned to you
2. **Resume Work**: Click any task to see details, previous edits, and current status
3. **Complete Data Collection**: If a task has a form, fill it out and click "Save" to commit data or "Mark Complete" to submit
4. **Request Help**: Use the Help tab to ask overseers for guidance on blocked tasks
5. **Progress Tasks**: Use the Progress Controls buttons to move tasks through stages (In Progress → Review → Done, etc.)

### Key Interactions
- **Switch Views**: Click "Board View" or "Executor View" in the sidebar
- **Select Board**: Click any board name in the sidebar; overseers see the Kanban board, executors see filtered work
- **Open Task Detail**: Click any task card to open the expandable task modal
- **Edit Task**: Overseer: hover over title/description to edit inline; click pencil icon to modify
- **Draft Preservation**: Form data auto-saves every second; reload and your draft is still there

---

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router, Server & Client Components)
- **UI Framework**: React 19 with TypeScript
- **State Management**: Zustand (with localStorage persistence)
- **Component Library**: shadcn/ui (Tailwind CSS v4)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Form Control**: Custom React hooks (`useAutoSave`, `useIsMobile`)
- **Deployment**: Vercel (optional, but recommended)

### Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   └── page.tsx            # Main App component
├── components/
│   ├── sidebar.tsx         # Board & view selection sidebar
│   ├── top-bar.tsx         # Header with user switcher
│   ├── board-view.tsx      # Overseer: Kanban board
│   ├── executor-view.tsx   # Executor: Work queue & detail
│   ├── task-detail-dialog.tsx  # Expandable task modal
│   ├── data-collection-form.tsx # Form input component
│   ├── status-signal.tsx   # Visual priority indicator
│   ├── task-card.tsx       # Task preview component
│   ├── create-task-dialog.tsx
│   ├── create-board-dialog.tsx
│   ├── manage-stages-dialog.tsx
│   ├── add-members-dialog.tsx
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── store.ts            # Zustand store (all state & actions)
│   ├── types.ts            # TypeScript domain models
│   ├── constants.ts        # Task priorities, statuses, colors
│   └── utils.ts            # cn() utility for Tailwind merging
└── hooks/
    ├── use-auto-save.ts    # Draft auto-save hook
    └── use-mobile.ts       # Responsive mobile detection
```

### State Management (Zustand)
All application state lives in `lib/store.ts`:
- **Users**: Current user, all system users, role management
- **Boards**: Created boards, stages, team members per board
- **Tasks**: Task CRUD, status transitions, edit history, help requests
- **UI**: Selected board/task, view mode (overseer/executor), board filters
- **Draft Data**: Temporary form state with auto-save and commit/discard

**Key Design**: No Redux boilerplate; persist to localStorage automatically; type-safe actions.

### Component Patterns
- **Server vs. Client**: Main `page.tsx` is a Client Component (for demo initialization); views are Client Components
- **Reusable Components**: Sidebar, TopBar, and TaskCard are shared; views layer context-specific logic on top
- **Composition**: TaskDetailDialog and form components are independent, composed into views
- **State Colocalization**: Local component state (form inputs, edit modes) stays in components; shared state lives in Zustand

---

## Development

### Running Tests
The demo data provides test scenarios:
- **Test Overseer Context**: Switch to "Wamunyima Mukelabai", create a task, move it through stages
- **Test Executor Context**: Switch to "Mike Zambia", complete an assigned task with a form
- **Test Help Requests**: Assign a task to an executor, request help as executor, acknowledge/resolve as overseer
- **Test Data Persistence**: Refresh the page; all boards and tasks persist

### Customization
- **Add New Task Types**: Extend `TaskType` in `lib/types.ts`; add handling in `create-task-dialog.tsx`
- **Add Board Stages**: Override `DEFAULT_BOARD_STAGES` in `lib/constants.ts` or allow users to create custom stages
- **Modify Colors**: Update `STATUS_SIGNAL_COLORS` and `DEFAULT_STAGE_COLORS` in `lib/constants.ts`
- **Extend Edit History**: Modify `createEditHistoryEntry()` in `lib/store.ts` to track additional fields

### Build & Deployment
```bash
# Build for production
npm run build

# Run production server locally
npm start

# Deploy to Vercel
vercel
```

---

## Accessibility & Performance

- **Semantic HTML**: Proper heading hierarchy, ARIA labels, and form semantics
- **Keyboard Navigation**: Tab order, Enter/Escape shortcuts, focus management
- **Color Contrast**: All text meets WCAG AA standards
- **Mobile Responsive**: Flexbox layouts, touch-friendly buttons (min 44x44px)
- **Performance**: Zustand prevents unnecessary re-renders; Framer Motion uses GPU acceleration; localStorage is opt-in

---

## Challenge Alignment

### How WorkFlow Addresses the Brief

**"Enable users to quickly resume work"**
- Edit history with timestamps shows exactly what changed since last visit
- Task detail modal displays recent modifications first
- Draft preservation restores incomplete data collection work automatically

**"Clearly communicate state and requirements"**
- Visual signals (priority badges, form flags, help request alerts) surface blockers
- Board stages show explicit workflow progression
- Status indicators pulse to draw attention to critical items

**"Help users decide what to do next"**
- Priority badges guide urgency perception
- Help request system surfaces blockers needing escalation
- Filters and task grouping reduce cognitive load

**"Dual Operating Contexts"**
- Overseer: Kanban board for multi-stream oversight; intervention without micromanagement
- Executor: Work queue for focused task completion; progress controls for self-direction
- Shared components prevent duplication while enabling context-specific UX

---

## Future Enhancements
- Bulk task operations (bulk reassign, bulk status change)
- Task dependencies and blocking relationships
- Recurring tasks and templates
- Advanced filtering (by assignee, priority, date, custom fields)
- Task activity feed for real-time collaboration
- Export/import boards and tasks (CSV, JSON)
- Dark mode (theme provider is already in place)

---

## License
MIT

---

## Contact & Submission
- **Author**: Wamunyima Mukelabai
- **Challenge Submission**: [Open Ownership Frontend Challenge](#)
- **Email**: wamunyima@workflow.app

---

## Troubleshooting

**Q: My data disappeared after closing the browser.**
A: Check browser privacy settings. WorkFlow uses localStorage; if it's disabled, data won't persist. Try using incognito mode or a different browser.

**Q: How do I switch between users?**
A: Click the user avatar in the top-right corner and select a different user from the dropdown.

**Q: How do I clear all demo data and start fresh?**
A: Open browser DevTools → Application → Local Storage → Clear "workflow-pro-app-state".

**Q: Can I deploy this myself?**
A: Yes! Push to GitHub, connect to Vercel, and click "Deploy". All state persists via localStorage on the client side—no backend required.

---

**Happy task managing! 🚀**
