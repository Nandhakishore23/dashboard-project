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

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or cloud database like Supabase/Render)

### 2. Database Setup

**Local PostgreSQL:**
- Install from https://www.postgresql.org/download/windows/
- Create database: `dashboard_db`
- Password: `password123`

**Or Cloud Database:**
- Create free account at https://supabase.com
- Copy external connection URL

### 3. Configure Environment

Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/dashboard_db"
JWT_ACCESS_SECRET="your-secret-key-min-32-characters-long"
JWT_REFRESH_SECRET="another-secret-key-min-32-chars-long"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

### 4. Install & Run

**Backend:**
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run seed
npm run dev
```

**Frontend (new terminal):**
```bash
cd frontend
npm install
npm run dev
```

### 5. Access
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### 6. Login Credentials

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

### Models

| Model | Description |
|-------|-------------|
| User | id, email, password, name, role (ADMIN/PM/DEVELOPER) |
| Project | id, name, description, ownerId |
| Task | id, title, status, priority, dueDate, isOverdue, projectId, assignedToId |
| ActivityLog | id, action, details, userId, projectId, taskId |
| Notification | id, message, type, isRead, userId |

### Indexes
- Task.assignedToId, Task.projectId, Task.status, Task.isOverdue
- ActivityLog.userId, ActivityLog.projectId
- Notification.userId, Notification.isRead

---

## Project Structure

### Backend
```
backend/
├── src/
│   ├── config/database.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── project.controller.ts
│   │   ├── task.controller.ts
│   │   ├── notification.controller.ts
│   │   └── activity.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── role.middleware.ts
│   ├── routes/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── socket.service.ts
│   │   └── cron.service.ts
│   ├── types/index.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── store/
│   └── types/
├── package.json
└── vite.config.ts
```

---

## Key Features

### Authentication
- JWT Access Token (15 min)
- Refresh Token (7 days) in HttpOnly cookie

### Role-Based Access
| Role | Access |
|------|--------|
| ADMIN | All projects, tasks, activities |
| PM | Own projects only |
| DEVELOPER | Assigned tasks only |

### Real-Time Updates
- Role-filtered activity feed via Socket.io
- Catch-up: Last 20 events on connection

### Background Jobs
- Overdue task checker every 5 minutes
- Daily digest at 9 AM

---

## Available Scripts

### Backend
```bash
npm run dev          # Start server
npm run build       # Build
npm run seed        # Seed database
npm run db:push     # Push schema
npm run db:generate # Generate Prisma client
```

### Frontend
```bash
npm run dev    # Start Vite
npm run build  # Build
```
