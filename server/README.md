# taskflow_api

Enterprise Node.js & Express REST API for TaskFlow, backed by a high-performance SQLite relational database with strict JWT Bearer authentication, RFC 9457 error boundaries, Helmet security policies, and rate limiting.

## Features

- Pure SQL Relational Database: SQLite with WAL mode, foreign keys, and cascade operations.
- Native Enterprise Authentication: Passwords hashed with bcrypt (salt rounds 10), RFC-compliant JWT session tokens.
- Role-Based Access Control (RBAC): Strict separation of privileges between Project Owners and Members.
- Production Defensive Security: Helmet CSP, HSTS, rate limiting (100 req/min), and audit tracking headers (`X-Request-Id`, `X-Backend-Engine`, `X-Database`).
- Single-Query Metrics Aggregation: High-throughput KPI matrix for dashboard statistics.

## Tech Stack

- Runtime: Node.js 20+
- Framework: Express 4.21+ with TypeScript
- Database: SQLite 3 (`sqlite3`)
- Validation: Zod 3.23+
- Security: Helmet, bcryptjs, jsonwebtoken, express-rate-limit

## Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Start development server with live reload
npm run dev

# 4. Build for production
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new account (`displayName`, `email`, `password`, `role`)
- `POST /api/auth/login` - Authenticate credentials and receive JWT Bearer token
- `GET /api/auth/me` - Retrieve authenticated user profile (Bearer token required)
- `GET /api/auth/users` - List registered user accounts

### Projects
- `GET /api/projects` - List accessible projects for authenticated user
- `POST /api/projects` - Create a new project (Creator is assigned as Owner)
- `GET /api/projects/:id` - Retrieve project details and team member roster
- `PATCH /api/projects/:id` - Update project title and description (Owner only)
- `DELETE /api/projects/:id` - Cascade delete project and associated tasks (Owner only)
- `POST /api/projects/:id/members` - Add registered member to project by email (Owner only)
- `DELETE /api/projects/:id/members/:memberId` - Remove member and unassign their tasks (Owner only)

### Tasks
- `GET /api/projects/:id/tasks` - List project tasks with assignee and creator details
- `POST /api/projects/:id/tasks` - Create a new task within project
- `PATCH /api/projects/:id/tasks/:taskId` - Update task status, priority, or assignee
- `DELETE /api/projects/:id/tasks/:taskId` - Delete task (Owner or Creator only)

### Metrics & Health
- `GET /api/metrics` - Aggregated dashboard KPIs (totalProjects, totalTasks, inProgress, done, overdue)
- `GET /api/health` - Service health status, database connection, and security headers
