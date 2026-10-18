# TaskFlow Enterprise: Pure SQL Architecture & Live Engineering Blueprint

> Note: This document provides the authoritative technical reference for TaskFlow Enterprise, documenting the standalone SQL relational backend, native JWT authentication, and full-stack REST API contracts.

---

## 1. Project Overview

TaskFlow is an enterprise-grade project and task management system designed for engineering teams to coordinate software projects, manage workflows, track completion metrics, and enforce strict role-based access control (RBAC).

---

## 2. Architecture & Tech Stack

TaskFlow operates on a decoupled client-server architecture with zero external third-party backend-as-a-service dependencies:
1. Primary Enterprise API Target: `https://taskflow-taqat.apps.taqat.acadamay/api`
2. Local Development Service: `http://localhost:5001/api`
3. Dynamic Runtime Resolution: Checked via `localStorage.getItem('taskflow_api_url')`, environment variable `NEXT_PUBLIC_BACKEND_API_URL`, or local fallback.

### Technology Stack

| Layer | Technology | Primary Versions |
| :--- | :--- | :--- |
| Frontend Framework | Next.js 14 App Router, React 18, TypeScript 5 | Next 14.2.15, React 18.3.1, TS 5.6.2 |
| Component System | Ant Design (antd 6), Ant Design Icons, Tailwind CSS | antd ^6.6.6, tailwindcss ^3.4.12 |
| Backend Runtime | Node.js Express Service with TypeScript execution | express ^4.21.0, tsx ^4.19.1 |
| Relational Database | SQLite 3 Relational Engine (WAL Mode & Foreign Keys) | sqlite3 ^6.0.1 |
| Authentication & Hashing | RFC 7519 JSON Web Tokens (JWT) + bcryptjs Salt 10 | jsonwebtoken ^9.0.3, bcryptjs ^3.0.3 |
| Defensive Security | Helmet CSP, HSTS, Rate Limiting, Audit Tracing | helmet ^8.0.0, express-rate-limit ^8.7.1 |
| Input Validation | Zod Schema Validation | zod ^3.23.8 |

---

## 3. Project Directory Structure

```text
TaskFlow/
|-- .env / .env.local / .env.example     # Environment variables and API URL configuration
|-- package.json                         # Next.js frontend dependencies (Zero Firebase)
|-- tailwind.config.ts                   # Tailwind CSS configuration and dark theme palette
|-- PROJECT_DOCUMENTATION.md             # Authoritative technical documentation
|
|-- src/                                 # Next.js App Router frontend source
|   |-- types/
|   |   `-- index.ts                     # TypeScript models (UserProfile, Project, Task, Metrics)
|   |-- lib/
|   |   |-- api.ts                       # Enterprise API client with dynamic resolution and failover
|   |   `-- utils.ts                     # Task utility functions (isTaskOverdue, formatDate)
|   |-- context/
|   |   |-- AuthContext.tsx              # Native JWT session management and demo role switcher
|   |   `-- ThemeContext.tsx             # Dark / light theme management
|   |-- components/
|   |   |-- providers/
|   |   |   `-- AntdProvider.tsx         # Ant Design theme provider
|   |   |-- layout/
|   |   |   `-- Navbar.tsx               # Header with SQL engine status popover and role switcher
|   |   `-- ui/
|   |       |-- Logo.tsx                 # TaskFlow vector brand icon
|   |       `-- TeamRosterModal.tsx      # Comprehensive project team modal with role sorting
|   |-- services/
|   |   `-- dataStore.ts                 # Clean DataService dispatching requests to SQL REST API
|   `-- app/                             # Next.js application routes
|       |-- layout.tsx                   # Root layout with providers
|       |-- page.tsx                     # Landing presentation page
|       |-- login/page.tsx               # Sign in page with 1-click evaluation quick fill
|       |-- register/page.tsx            # Account registration
|       |-- dashboard/page.tsx           # Metrics summary cards and project grid
|       `-- projects/
|           |-- new/page.tsx             # Project creation page
|           `-- [id]/
|               |-- page.tsx             # Kanban board and task management interface
|               `-- settings/page.tsx    # Project settings, member management, cascade deletion
|
`-- server/                              # Standalone Node.js Express REST API service
    |-- .env                             # Backend port, database file path, and JWT secret
    |-- package.json                     # Backend dependencies (sqlite3, bcryptjs, jsonwebtoken, express)
    |-- tsconfig.json                    # Backend TypeScript configuration
    |-- data/
    |   `-- taskflow.db                  # Relational SQLite database file
    `-- src/
        |-- index.ts                     # Server bootstrap, database init, and route registration
        |-- config/
        |   `-- database.ts              # SQLite connection, schema migrations, and demo seeder
        |-- types/
        |   `-- index.ts                 # Backend request and domain entity types
        |-- middlewares/
        |   |-- auth.ts                  # JWT token verification and user loading from SQL
        |   |-- errorHandler.ts          # Centralized RFC 9457 error boundary
        |   `-- security.ts              # Helmet policies, rate limiters, and audit headers
        |-- validators/
        |   `-- schemas.ts               # Zod validation schemas
        |-- routes/
        |   |-- health.ts                # Service health and database inspection endpoint
        |   |-- auth.ts                  # Register, login, me, and user list routes
        |   |-- projects.ts              # Project and member management routes
        |   |-- tasks.ts                 # Task CRUD routes
        |   `-- metrics.ts               # Aggregated metrics KPI endpoint
        `-- controllers/
            |-- authController.ts        # bcrypt registration, password verification, and JWT generation
            |-- projectsController.ts    # SQL queries for projects and project members
            |-- tasksController.ts       # SQL queries for tasks with assignee joins
            `-- metricsController.ts     # Single-query SQL aggregation for dashboard metrics
```

---

## 4. Relational SQL Database Schema

All data is stored with relational integrity in `server/data/taskflow.db`:

### Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | UUIDv4 identifier |
| `email` | TEXT | UNIQUE NOT NULL | Normalized lowercase user email |
| `password_hash` | TEXT | NOT NULL | bcrypt hash with salt rounds 10 |
| `display_name` | TEXT | NOT NULL | Full name of the user |
| `role` | TEXT | NOT NULL DEFAULT 'member' | System role ('owner', 'member', 'trainee') |
| `created_at` | TEXT | NOT NULL | ISO 8601 creation timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 update timestamp |

### Table: `projects`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | UUIDv4 identifier |
| `name` | TEXT | NOT NULL | Project name (3-80 characters) |
| `description` | TEXT | NULLABLE | Detailed project overview |
| `owner_id` | TEXT | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Project creator / owner |
| `created_at` | TEXT | NOT NULL | ISO 8601 creation timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 update timestamp |

### Table: `project_members`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `project_id` | TEXT | NOT NULL, REFERENCES projects(id) ON DELETE CASCADE | Project identifier |
| `user_id` | TEXT | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Member user identifier |
| `role` | TEXT | NOT NULL DEFAULT 'member' | Project role ('owner', 'member', 'trainee') |
| `joined_at` | TEXT | NOT NULL | ISO 8601 membership timestamp |
| PRIMARY KEY | (project_id, user_id) | Composite Primary Key | Enforces unique project membership |

### Table: `tasks`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | UUIDv4 identifier |
| `project_id` | TEXT | NOT NULL, REFERENCES projects(id) ON DELETE CASCADE | Owning project |
| `title` | TEXT | NOT NULL | Task title (3-120 characters) |
| `description` | TEXT | NULLABLE | Task requirements |
| `status` | TEXT | NOT NULL DEFAULT 'todo' | Status ('todo', 'in_progress', 'done') |
| `priority` | TEXT | NOT NULL DEFAULT 'medium' | Priority ('low', 'medium', 'high') |
| `assignee_id` | TEXT | NULLABLE, REFERENCES users(id) ON DELETE SET NULL | Assigned team member |
| `created_by` | TEXT | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Task author |
| `due_date` | TEXT | NULLABLE | Due date in YYYY-MM-DD format |
| `created_at` | TEXT | NOT NULL | ISO 8601 creation timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 update timestamp |

---

## 5. Enterprise REST API Endpoints

The backend listens on Port 5001 and handles requests with JWT Bearer tokens:

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service status, SQL database health, uptime, and security flags | Public |
| `POST` | `/api/auth/register` | Register new account with bcrypt password hashing | Public |
| `POST` | `/api/auth/login` | Authenticate credentials and receive JWT Bearer token | Public |
| `GET` | `/api/auth/me` | Fetch active user profile using JWT session token | Authenticated |
| `GET` | `/api/auth/users` | List registered accounts for team selection | Authenticated |
| `GET` | `/api/metrics` | Single-query SQL dashboard KPI aggregation | Authenticated |
| `GET` | `/api/projects` | List projects where user is owner or member | Project Member / Owner |
| `POST` | `/api/projects` | Create new project with automatic owner membership | Authenticated |
| `GET` | `/api/projects/:id` | Retrieve project details and full member roster | Project Member / Owner |
| `PATCH` | `/api/projects/:id` | Update project name or description | Project Owner Only |
| `DELETE` | `/api/projects/:id` | Cascade delete project, member links, and all tasks | Project Owner Only |
| `POST` | `/api/projects/:id/members` | Add registered user to project by email | Project Owner Only |
| `DELETE` | `/api/projects/:id/members/:memberId` | Remove member and unassign their active tasks | Project Owner Only |
| `GET` | `/api/projects/:id/tasks` | List project tasks with assignee join details | Project Member / Owner |
| `POST` | `/api/projects/:id/tasks` | Create task and validate assignee membership | Project Member / Owner |
| `PATCH` | `/api/projects/:id/tasks/:taskId` | Update task status, priority, or assignee | Owner, Creator, or Assignee |
| `DELETE` | `/api/projects/:id/tasks/:taskId` | Delete task | Owner or Creator Only |

---

## 6. Defensive Security & Auditing Headers

Every response from the backend contains strict provenance and hardening headers:
- `X-Backend-Engine: TaskFlow Standalone SQL Service`
- `X-Database: SQLite Relational Database Engine`
- `X-Security-Policy: Enterprise JWT + Strict RBAC`
- `X-Request-Id: <UUIDv4>`
- `X-Response-Time: <duration in ms>`
- `RateLimit-Limit: 100` (60 second rolling window)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## 7. Demo Accounts & Quick Verification

### Seed Accounts (Password: `password123`)
| Role | Email Address | Display Name | Permissions |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@taqat-gaza.com` | Enterprise Admin | Full project creation, deletion, settings, and member management |
| **Member** | `member@taqat-gaza.com` | Lead Engineer | Create tasks, edit assigned tasks, update task status |
| **Trainee** | `trainee@taqat-gaza.com` | Software Trainee | View projects, complete assigned tasks |

### Service Startup Commands
```bash
# Start Backend Service (Port 5001)
cd server
npm run dev

# Start Frontend Application (Port 3000)
npm run dev
```
