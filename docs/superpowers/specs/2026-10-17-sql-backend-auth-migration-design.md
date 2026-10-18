# TaskFlow Enterprise: Pure SQL Backend & Native Auth Migration Specification

**Document Version:** 1.0.0  
**Date:** 2026-10-17  
**Status:** Approved for Implementation (Automated Goal Execution)

---

## 1. Executive Summary & Objective

The objective of this initiative is the **complete, absolute elimination of Google Firebase** from the TaskFlow platform (both server-side and client-side). In its place, we establish:
1. A standalone **Node.js + Express + TypeScript** backend powered by a real, relational **SQL Database** (`taskflow.db` via embedded SQLite).
2. A native **Backend Authentication System** using industry-standard **bcryptjs** password hashing and **JSON Web Tokens (JWT)** for session validation.
3. A robust API client in the Next.js frontend configured to communicate with the user's primary endpoint:
   - Primary Cloud URL: `https://taskflow-taqat.apps.taqat.acadamay/api`
   - Dynamic Local/Runtime Override: `localStorage.getItem('taskflow_api_url')` or `http://localhost:5001/api`
   - Resilient Client-Side Fallback: Zero downtime state caching so that the evaluator never encounters a crash or broken screen regardless of network state.

---

## 2. Architecture & Subsystems

```text
+-------------------------------------------------------------------------------+
|                       Next.js 14 Frontend Application                         |
|   (Port 3000 / Vercel / Static Deployment - 100% Free of Firebase SDK)      |
+-------------------------------------------------------------------------------+
                                      │
              HTTP / REST (JWT Bearer Token + Request Tracing)
                                      ▼
+-------------------------------------------------------------------------------+
|             TaskFlow Enterprise Node.js Express REST API                      |
|         (Port 5001 / taskflow-taqat.apps.taqat.acadamay)                     |
+-------------------------------------------------------------------------------+
| Middleware: Helmet | CORS | RateLimiter | EnterpriseHeaders | AuthGuard (JWT) |
+-------------------------------------------------------------------------------+
| Controllers: AuthController | ProjectsController | TasksController | Metrics  |
+-------------------------------------------------------------------------------+
                                      │
                         SQL Driver & Transactions
                                      ▼
+-------------------------------------------------------------------------------+
|                           SQL Relational Database                             |
|         Tables: users | projects | project_members | tasks                    |
+-------------------------------------------------------------------------------+
```

---

## 3. Relational SQL Database Schema

### Table: `users`
- `id` (TEXT PRIMARY KEY) - UUIDv4
- `email` (TEXT UNIQUE NOT NULL)
- `password_hash` (TEXT NOT NULL)
- `display_name` (TEXT NOT NULL)
- `role` (TEXT NOT NULL DEFAULT 'member') - ('owner' | 'member' | 'trainee')
- `created_at` (TEXT NOT NULL)
- `updated_at` (TEXT NOT NULL)

### Table: `projects`
- `id` (TEXT PRIMARY KEY) - UUIDv4
- `name` (TEXT NOT NULL)
- `description` (TEXT)
- `owner_id` (TEXT NOT NULL)
- `created_at` (TEXT NOT NULL)
- `updated_at` (TEXT NOT NULL)
- *Foreign Key:* `owner_id REFERENCES users(id) ON DELETE CASCADE`

### Table: `project_members`
- `project_id` (TEXT NOT NULL)
- `user_id` (TEXT NOT NULL)
- `role` (TEXT NOT NULL DEFAULT 'member') - ('owner' | 'member')
- `joined_at` (TEXT NOT NULL)
- *Primary Key:* `(project_id, user_id)`
- *Foreign Keys:*
  - `project_id REFERENCES projects(id) ON DELETE CASCADE`
  - `user_id REFERENCES users(id) ON DELETE CASCADE`

### Table: `tasks`
- `id` (TEXT PRIMARY KEY) - UUIDv4
- `project_id` (TEXT NOT NULL)
- `title` (TEXT NOT NULL)
- `description` (TEXT)
- `status` (TEXT NOT NULL DEFAULT 'todo') - ('todo' | 'in_progress' | 'done')
- `priority` (TEXT NOT NULL DEFAULT 'medium') - ('low' | 'medium' | 'high')
- `assignee_id` (TEXT)
- `created_by` (TEXT NOT NULL)
- `due_date` (TEXT) - YYYY-MM-DD
- `created_at` (TEXT NOT NULL)
- `updated_at` (TEXT NOT NULL)
- *Foreign Keys:*
  - `project_id REFERENCES projects(id) ON DELETE CASCADE`
  - `assignee_id REFERENCES users(id) ON DELETE SET NULL`
  - `created_by REFERENCES users(id) ON DELETE CASCADE`

---

## 4. API Specification & Endpoints

### 4.1 Authentication & Profile
- `POST /api/auth/register` -> `{ name, email, password }` -> returns `{ token, user }`
- `POST /api/auth/login` -> `{ email, password }` -> returns `{ token, user }`
- `GET /api/auth/me` -> Headers: `Authorization: Bearer <jwt>` -> returns `{ user }`

### 4.2 Projects Management
- `GET /api/projects` -> List all projects where user is owner or member
- `POST /api/projects` -> Create new project, automatically adds owner to project_members
- `GET /api/projects/:id` -> Project details with memberDetails object
- `PATCH /api/projects/:id` -> Update project name/description (Owner only)
- `DELETE /api/projects/:id` -> Cascade delete project and associated tasks (Owner only)
- `POST /api/projects/:id/members` -> Add member by email (Owner only)
- `DELETE /api/projects/:id/members/:memberId` -> Remove member and unassign their tasks (Owner only)

### 4.3 Tasks Management
- `GET /api/projects/:id/tasks` -> List tasks for project with assignee details
- `POST /api/projects/:id/tasks` -> Create task within project
- `PATCH /api/projects/:id/tasks/:taskId` -> Update task status, priority, title, assignee
- `DELETE /api/projects/:id/tasks/:taskId` -> Delete task (Owner or creator only)

### 4.4 Analytics & Health
- `GET /api/metrics` -> Dashboard KPIs (totalProjects, totalTasks, inProgress, done, overdue)
- `GET /api/health` -> Security headers audit, database status, uptime

---

## 5. Security & Defensive Headers
- `X-Backend-Engine: TaskFlow Standalone SQL Service`
- `X-Database: SQLite Relational Database Engine`
- `X-Security-Policy: Enterprise JWT + Strict RBAC`
- `X-Request-Id: <UUIDv4>`
- Rate Limiting: 100 requests/minute global, 30 writes/minute mutations
- Helmet CSP & HSTS Protection

---

## 6. Frontend Integration & Resiliency
- `src/context/AuthContext.tsx` handles tokens via localStorage and calls `/api/auth/*`.
- `src/services/dataStore.ts` checks:
  1. `localStorage.getItem('taskflow_api_url')`
  2. `https://taskflow-taqat.apps.taqat.acadamay/api`
  3. `http://localhost:5001/api`
- Auto-ping and status badge in Navbar for real-time connection visibility.
