# Real-Time Client Project Dashboard

A full-stack project management dashboard with role-based access control, real-time updates, and background job processing.

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React 18 + TypeScript, TanStack Query, Zustand, Socket.io Client |
| Backend | Node.js + Express, TypeScript, Socket.io, Prisma |
| Database | PostgreSQL with Prisma ORM |
| Background Jobs | node-cron |

---

## Quick Start (Local)

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use a cloud database like Supabase/Render)

### 2. Database Setup

**Option A: Local PostgreSQL**
- Install PostgreSQL from https://www.postgresql.org/download/windows/
- Create a database named `dashboard_db`
- Set password to `password123`

**Option B: Cloud Database (Recommended)**
- Create a free account at https://supabase.com or https://render.com
- Create a PostgreSQL database
- Copy the external connection URL

### 3. Configure Environment

Create/update `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dashboard_db"
# OR for cloud database:
# DATABASE_URL="postgresql://user:password@host:port/database"
JWT_ACCESS_SECRET="your-secret-key-min-32-characters-long"
JWT_REFRESH_SECRET="another-secret-key-min-32-chars-long"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=4000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

### 4. Install and Run Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run seed
npm run dev
```

### 5. Install and Run Frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

### 6. Access the App

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000

### 7. Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | password123 |
| PM | pm1@company.com | password123 |
| PM | pm2@company.com | password123 |
| Developer | dev1@company.com | password123 |
| Developer | dev2@company.com | password123 |
| Developer | dev3@company.com | password123 |
| Developer | dev4@company.com | password123 |

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐
│    User     │       │   Project   │
├─────────────┤       ├─────────────┤
│ id          │◄──────│ ownerId     │
│ email       │       │ id          │
│ password    │       │ name        │
│ name        │       │ description │
│ role        │       └──────┬──────┘
└──────┬──────┘              │
       │                     │
       │         ┌───────────┴───────────┐
       │         │                       │
       ▼         ▼                       ▼
┌─────────────┐ ┌─────────────┐  ┌─────────────┐
│   Task      │ │ActivityLog │  │Notification│
├─────────────┤ ├─────────────┤  ├─────────────┤
│ id          │ │ id          │  │ id          │
│ title       │ │ action      │  │ message     │
│ status      │ │ userId      │  │ type        │
│ priority    │ │ projectId   │  │ isRead      │
│ dueDate     │ │ taskId      │  │ userId      │
│ isOverdue   │ │ createdAt   │  │ createdAt   │
│ projectId   │ └─────────────┘  └─────────────┘
│ assignedToId│
└─────────────┘
```

### Models

| Model | Fields |
|-------|--------|
| User | id, email, password, name, role (ADMIN/PM/DEVELOPER) |
| Project | id, name, description, ownerId (FK to User) |
| Task | id, title, description, status, priority, dueDate, isOverdue, projectId (FK), assignedToId (FK) |
| ActivityLog | id, action, details, userId (FK), projectId (FK), taskId (FK) |
| Notification | id, message, type, isRead, userId (FK) |

### Indexes

```prisma
@@index([assignedToId])  // Task - Developer's task lookup
@@index([projectId])      // Task, ActivityLog - Project queries
@@index([status])        // Task - Status filtering
@@index([isOverdue])     // Task - Overdue filtering
@@index([userId])        // ActivityLog, Notification - User queries
@@index([isRead])        // Notification - Unread count
```

---

## Project Structure

### Backend
```
backend/
├── src/
│   ├── config/database.ts          # Prisma client
│   ├── controllers/                 # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── project.controller.ts
│   │   ├── task.controller.ts
│   │   ├── notification.controller.ts
│   │   └── activity.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   └── role.middleware.ts      # RBAC enforcement
│   ├── routes/                     # API routes
│   ├── services/
│   │   ├── auth.service.ts         # JWT operations
│   │   ├── socket.service.ts       # Real-time events
│   │   └── cron.service.ts         # Background jobs
│   ├── types/index.ts              # TypeScript types
│   └── index.ts                    # Express entry
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Test data
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── api/                        # API client
│   ├── components/                 # React components
│   ├── context/                    # Auth & Socket contexts
│   ├── hooks/                      # TanStack Query hooks
│   ├── store/                      # Zustand state
│   └── types/
├── package.json
└── vite.config.ts
```

---

## Architectural Decisions

### WebSocket Library: Socket.io

**Why Socket.io over native WebSockets?**
1. **Automatic Fallback**: Socket.io falls back to polling when WebSocket unavailable
2. **Room Management**: Built-in `socket.join()` maps to role-filtered requirements
3. **Reconnection**: Automatic with exponential backoff
4. **TypeScript Support**: First-class type definitions

### Job Queue: node-cron

**Why node-cron over Bull/BullMQ?**
1. **No Redis Dependency**: Runs in-process
2. **Lightweight**: ~5KB vs BullMQ's ~50KB+
3. **Sufficient Reliability**: 5-minute interval adequate for overdue task detection

### Token Storage: HttpOnly Cookies

**Why HttpOnly cookies for refresh tokens?**
1. **XSS Protection**: JavaScript cannot read HttpOnly cookies
2. **CSRF Protection**: Using `credentials: include` in fetch
3. **Security**: Refresh tokens never exposed to client JavaScript

---

## API Error Format

All errors return:
```json
{
  "error": "Human-readable message",
  "code": 403
}
```

---

## Key Features

### Authentication
- JWT Access Token (15min expiry)
- Refresh Token (7d expiry) stored in HttpOnly cookie

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| ADMIN | View all projects, tasks, activities |
| PM | CRUD on owned projects, view all project tasks |
| DEVELOPER | View/update only assigned tasks |

### Real-Time Updates (Socket.io)
- Role-filtered activity feed:
  - Admin: sees all activities
  - PM: sees only their projects
  - Developer: sees only their tasks
- **Catch-up**: Last 20 events sent on connection

### Background Jobs (node-cron)
- Checks overdue tasks every 5 minutes
- Sets `isOverdue = true` in database
- Creates notification for assigned user

### Dashboard Filters
- Status, Priority, Project, Overdue, Date range
- All filters sync with URL query params

---

## Known Limitations

1. **Single Server Deployment**: Socket.io requires sticky sessions for horizontal scaling
2. **No Real-Time Conflict Resolution**: Multiple users editing same task may cause conflicts
3. **Limited Offline Support**: No offline queue for actions
4. **No File Upload**: Project attachments not implemented

---

## Available Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run seed         # Seed database
npm run db:push      # Push schema to DB
npm run db:generate  # Generate Prisma client
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```
