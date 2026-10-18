# TaskFlow — Project & Task Management System

**7-Day Full-Stack Development Challenge • Version 1.0**  
Prepared for **TAQAT / CodeMap Trainees Evaluation**

TaskFlow is a responsive, full-stack web application designed for small software teams to organize projects, assign tasks, collaborate with role-based access control, track milestones, and monitor deadlines.

---

## Key Features

1. **Authentication & Authorization (FR-01 to FR-04)**
   - Firebase Authentication with email & password.
   - Protected routes with smart session redirection (`/dashboard` vs `/login`).
   - Profile documents stored in `/users/{uid}` with public display name and UID.
   - 1-Click demo role switcher for quick evaluator testing between **Owner** and **Member**.

2. **Project Management (FR-05 to FR-07)**
   - Project creation with validated constraints: name (3–80 characters), description (max 1000 characters).
   - Owner-only administrative rights: edit project metadata, delete project with double-confirmation dialog.
   - Membership management: add existing registered users by email, prevent duplicates, and revoke access on removal.

3. **Task Management (FR-08 to FR-13)**
   - Tasks nested in subcollections (`projects/{projectId}/tasks/{taskId}`).
   - Fields: Title (3–120 characters), description, status (`todo`, `in_progress`, `done`), priority (`low`, `medium`, `high`), due date, and assignee.
   - Assignee validation: restricted strictly to active members of the relevant project.
   - Instant status toggling from the task card.
   - Edit and delete permissions: Owner or Task Creator.

4. **Discovery & Live Evaluation Exercise (FR-13 & Section 18)**
   - Client-side keyword search on task titles.
   - Multi-criteria filtering by Status, Priority, and Assignee.
   - **Live Evaluation Exercise — Overdue Tasks Filter**:
     - Instant filter chip showing tasks where:  
       `dueDate < today && status != 'done'`
     - Highlights overdue items with high-contrast alert badges.

5. **Dashboard & Metrics (FR-14)**
   - 4-Card KPI overview: Active Projects, Total Tasks, Tasks In Progress, and Overdue Tasks counter.
   - Projects overview grid with role badges, member counts, and last updated timestamps.

6. **Bonus Architecture: Node.js Express REST API (`server/`)**
   - Independent Node.js Express & TypeScript backend service located in `server/`.
   - Endpoints:
     - `GET /api/health` — Service health & uptime probe.
     - `GET /api/analytics/summary` — Aggregated task metrics across projects.
     - `GET /api/projects/:id/export?format=csv|json` — RFC 4180 streaming CSV or formatted JSON export of project tasks.

---

## Technology Stack

- **Frontend Framework:** Next.js 14 (App Router), React 18
- **Styling:** Tailwind CSS, responsive across mobile (375px), tablet (768px), and desktop (1280px)
- **Icons:** Ant Design Icons (`@ant-design/icons`)
- **Backend / Database:** Cloud Firestore & Firebase Auth
- **Bonus Backend:** Node.js, Express, TypeScript (`server/`)
- **Security:** Strict `firestore.rules` adhering to SRS Section 4 & 11

---

## Demo Accounts (TAQAT / CodeMap)

For rapid evaluation, the application provides built-in demo credentials with 1-click autofill on the login screen or via the Navbar role switcher:

| Role | Email | Password | Display Name |
| :--- | :--- | :--- | :--- |
| **Project Owner** | `owner@taqat-gaza.com` | `password123` | Ahmad Owner |
| **Project Member** | `member@taqat-gaza.com` | `password123` | Sami Member |
| **Trainee / Member** | `trainee@taqat-gaza.com` | `password123` | CodeMap Trainee |

---

## Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v24)
- npm `v9+` or `v11+`

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd TaskFlow

# Install Next.js frontend dependencies
npm install

# (Optional) Install Node.js bonus backend dependencies
cd server
npm install
cd ..
```

### 3. Environment Variables
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
*(If Firebase environment variables are omitted, TaskFlow automatically uses its resilient local storage adapter seeded with TAQAT demo accounts, ensuring complete offline evaluation without crashes).*

### 4. Running the Application
```bash
# Run Next.js frontend (default: http://localhost:3000)
npm run dev

# (Optional) Run Node.js bonus backend in a second terminal (default: http://localhost:5001)
cd server
npm run dev
```

---

## Firestore Security Rules Structure

The included `firestore.rules` file enforces database-level authorization:
- **Users (`/users/{uid}`):** Public read for member lookups; write restricted to self (`request.auth.uid == userId`).
- **Projects (`/projects/{projectId}`):**
  - Read: Only authenticated members or owner.
  - Create: Must set `ownerId == auth.uid` and include self in `memberIds`.
  - Update: Project owner only.
  - Delete: Project owner only.
- **Tasks (`/projects/{projectId}/tasks/{taskId}`):**
  - Read & Create: Project members only.
  - Update: Owner, task creator, or assigned member only.
  - Delete: Owner or task creator only.

---

## Live Evaluation Exercise: Overdue Tasks

During the review session, the **Overdue Tasks** feature can be demonstrated directly:
1. Open any project with tasks (e.g., `Website Redesign`).
2. Click the **"Overdue Tasks"** filter button on the search bar.
3. The table instantly filters down to tasks where `dueDate < today && status != 'done'`.
4. Marking the overdue task as **"Done"** immediately removes it from the overdue list, demonstrating edge-case reactivity.
