# SSR Portal

A production-style Training Institute Management Portal for **SSR Institute** — students, trainers,
courses, batches, attendance, tasks, placements, fees, certificates and more, built as two
independently deployable apps that talk over a REST API.

This is a large system being built in phases (see [Roadmap](#roadmap)). This README reflects what
is actually implemented today, not the full end-state spec.

## Architecture

```
SSR_PORTAL/
├── backend/    Express + TypeScript REST API, MongoDB via Mongoose
├── frontend/   Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
├── README.md
└── .gitignore
```

The frontend never talks to MongoDB directly — every read/write goes through the backend's
versioned REST API (`/api/v1/...`). Business logic lives in backend **services**; controllers stay
thin; the frontend calls typed **service modules** built on a shared Axios client.

## Tech stack

**Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query,
Zustand, Recharts, Framer Motion, Lucide icons.

**Backend:** Node.js, Express, TypeScript, Mongoose, MongoDB Atlas, JWT, bcryptjs, Zod, Helmet,
CORS, express-rate-limit.

## Authentication & RBAC architecture

- Registration (student or trainer) creates a `User` (status `PENDING`) plus a role-specific
  profile (`StudentProfile` / `TrainerProfile`) in one transaction, then emails a 6-digit OTP.
- Email must be verified via OTP before the account can be approved.
- An **ADMIN** approves or rejects pending users (`PATCH /api/v1/users/:id/approve|reject`).
  Only `ACTIVE` + email-verified users can log in.
- Login issues a short-lived **access token** (JWT, returned to the client and kept in memory /
  Zustand) and a long-lived **refresh token** stored as an `httpOnly` cookie scoped to
  `/api/v1/auth`. The frontend's Axios interceptor transparently refreshes on 401.
- Every request re-checks the user's live status in `authenticate` — a block/suspend takes effect
  immediately, not just on the next login.
- `authorize("ADMIN", ...)` middleware enforces role access **on the backend**. The frontend's
  `RequireAuth` component also gates dashboard routes client-side, but that is a UX convenience,
  never the source of truth — frontend and backend are on different origins in production, so a
  Next.js edge middleware cannot see the backend's httpOnly cookie anyway (see §74 of the spec).
- Passwords are hashed with bcrypt (12 rounds). Reset tokens and OTPs are stored as SHA-256 hashes,
  never in plaintext, and expire automatically (MongoDB TTL indexes).

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster (or any reachable MongoDB replica set — transactions are used, so a
  standalone `mongod` without a replica set will not work)

### Backend

```bash
cd backend
cp .env.example .env   # already done in this repo with generated JWT secrets — replace MONGODB_URI
npm install
npm run dev             # http://localhost:5000
```

Seed development data (creates the admin, 3 trainers, 10 students, and 4 courses):

```bash
npm run seed
```

Default seed credentials (change immediately outside of local development):

- Admin: `admin@ssrinstitute.in`
- Trainers/Students: `student1@ssrinstitute.in` … `student10@ssrinstitute.in`, etc.
- Password for all seeded accounts: `Passw0rd!` (override with `SEED_PASSWORD` env var)

### Frontend

```bash
cd frontend
cp .env.example .env.local   # already done — points at http://localhost:5000/api/v1
npm install
npm run dev              # http://localhost:3000
```

## API reference (implemented so far)

All responses follow `{ success, message, data, meta? }` on success or `{ success: false, message,
errors }` on failure. Base path: `/api/v1`.

### Auth (`/auth`)

| Method | Path                  | Auth | Body                                             |
|--------|-----------------------|------|---------------------------------------------------|
| POST   | `/register/student`   | –    | name, email, phone, password, confirmPassword, ...|
| POST   | `/register/trainer`   | –    | name, email, phone, password, confirmPassword, ...|
| POST   | `/verify-otp`         | –    | email, otp                                        |
| POST   | `/resend-otp`         | –    | email                                             |
| POST   | `/login`              | –    | email, password, rememberMe?                      |
| POST   | `/refresh-token`      | cookie | –                                                |
| POST   | `/logout`             | –    | –                                                  |
| POST   | `/forgot-password`    | –    | email                                              |
| POST   | `/reset-password`     | –    | token, password, confirmPassword                  |
| GET    | `/me`                 | JWT  | –                                                  |

### Users (`/users`) — ADMIN only

| Method | Path                    | Body            |
|--------|-------------------------|-----------------|
| GET    | `/`                     | query: page, limit, search, role, status, sortBy, sortOrder |
| GET    | `/stats`                | – (counts by role × status, plus published course count) |
| GET    | `/:id`                  | –               |
| PATCH  | `/:id/approve`          | –               |
| PATCH  | `/:id/reject`           | reason?         |
| PATCH  | `/:id/block`            | –               |
| PATCH  | `/:id/unblock`          | –               |
| PATCH  | `/:id/suspend`          | reason?         |
| PATCH  | `/:id/reactivate`       | –               |

### Courses (`/courses`)

| Method | Path            | Auth        | Body |
|--------|-----------------|-------------|------|
| GET    | `/`             | –           | – (published only — used by the registration form's course picker) |
| GET    | `/admin`        | ADMIN       | query: page, limit, search, status, sortBy, sortOrder |
| POST   | `/`             | ADMIN       | name, shortDescription, duration, fee, category?, fullDescription?, thumbnailUrl?, requirements?, learningOutcomes? |
| GET    | `/:id`          | ADMIN       | – |
| PATCH  | `/:id`          | ADMIN       | any subset of the create fields |
| PATCH  | `/:id/status`   | ADMIN       | status: DRAFT \| PUBLISHED \| ARCHIVED |

Courses are never hard-deleted — `PATCH /:id/status` with `ARCHIVED` is the soft-delete path.

### Modules & Lessons (curriculum, nested under a course)

| Method | Path                                    | Auth  | Body |
|--------|------------------------------------------|-------|------|
| GET    | `/courses/:courseId/modules`             | ADMIN | – |
| POST   | `/courses/:courseId/modules`             | ADMIN | name, description?, estimatedDuration? |
| PATCH  | `/courses/:courseId/modules/reorder`     | ADMIN | orderedIds: string[] (sets `order` = array index) |
| PATCH  | `/modules/:id`                           | ADMIN | any subset of the create fields |
| DELETE | `/modules/:id`                           | ADMIN | – (cascades: deletes the module's lessons too) |
| GET    | `/modules/:moduleId/lessons`             | ADMIN | – |
| POST   | `/modules/:moduleId/lessons`             | ADMIN | title, description?, estimatedMinutes? |
| PATCH  | `/modules/:moduleId/lessons/reorder`     | ADMIN | orderedIds: string[] |
| PATCH  | `/lessons/:id`                           | ADMIN | any subset of the create fields |
| DELETE | `/lessons/:id`                           | ADMIN | – |

Managed from `/admin/courses/[id]` (reached via "Manage curriculum" on a course row) — this is
what Trainer materials/tasks and Student course-progress will reference once those phases build
on top of it.

### Batches (`/batches`) — ADMIN only

| Method | Path                          | Body |
|--------|-------------------------------|------|
| GET    | `/`                           | query: page, limit, search, status, course, sortBy, sortOrder |
| POST   | `/`                           | name, course, trainer?, startDate, endDate, classDays, startTime, endTime, mode, location?, capacity |
| GET    | `/:id`                        | – |
| PATCH  | `/:id`                        | any subset of the create fields |
| PATCH  | `/:id/status`                 | status: UPCOMING \| ACTIVE \| COMPLETED \| CANCELLED |
| GET    | `/:id/students`               | – (enrolled roster) |
| POST   | `/:id/students`               | studentId (rejects if not ACTIVE, already enrolled, or batch is full) |
| DELETE | `/:id/students/:studentId`    | – |

### Fees (`/fees`) — ADMIN only

| Method | Path                              | Body |
|--------|-----------------------------------|------|
| GET    | `/status`                         | query: page, limit, search, batch, status — per-enrollment fee status, computed live from course fee − discount − sum(payments) |
| GET    | `/payments`                       | query: page, limit, search, batch, paymentMethod, sortBy, sortOrder |
| POST   | `/payments`                       | student, batch, amount, paymentMethod, paymentDate?, transactionRef?, notes? (student must already be enrolled in the batch) |
| GET    | `/payments/:studentId/:batchId`   | – (payment history) |
| PATCH  | `/enrollments/:enrollmentId/discount` | discount |

### Jobs / Placements (`/jobs`) — ADMIN only

| Method | Path                                    | Body |
|--------|------------------------------------------|------|
| GET    | `/`                                      | query: page, limit, search, status, sortBy, sortOrder |
| POST   | `/`                                      | company, title, description, workMode, applicationDeadline, openings, location?, salaryRange?, skills?, minExperienceYears?, educationRequirement?, jobLink?, eligibleCourses? |
| GET    | `/:id`                                   | – |
| PATCH  | `/:id`                                   | any subset of the create fields |
| PATCH  | `/:id/status`                            | status: DRAFT \| PUBLISHED \| CLOSED |
| GET    | `/:id/applications`                      | query: page, limit, status |
| PATCH  | `/applications/:applicationId/status`    | status, statusNote? |

### Announcements (`/announcements`)

| Method | Path   | Auth  | Body |
|--------|--------|-------|------|
| GET    | `/`    | any authenticated user | query: page, limit, audience |
| POST   | `/`    | ADMIN | title, content, audience, priority, batch? (required if audience=BATCH), course? (required if audience=COURSE), publishAt?, expiresAt? |
| DELETE | `/:id` | ADMIN | – |

### Audit Logs (`/audit-logs`) — ADMIN only

| Method | Path | Body |
|--------|------|------|
| GET    | `/`  | query: page, limit, action, entity |

## Roadmap

Built so far (Phase 1–2 of the spec's implementation order):

- [x] Project scaffolding (Next.js + Express + TypeScript + Mongoose + env config)
- [x] Registration (student/trainer) → OTP email verification → admin approval → login
- [x] JWT access/refresh tokens, forgot/reset password, RBAC middleware
- [x] Centralized error handling, request validation (Zod), rate limiting, audit log service,
      email service abstraction
- [x] Responsive dashboard shell (sidebar, topbar, mobile nav) with role-based navigation
- [x] Landing page, all auth pages, certificate-verification route stub
- [x] Placeholder pages for every dashboard route (no dead links while later phases are built)
- [x] Public course listing endpoint + course selection on student registration

Built so far (Phase 3, in progress):

- [x] Admin dashboard: real user/course stats (`GET /users/stats`) and a status-breakdown chart —
      no hardcoded numbers
- [x] Admin Users page: search, role/status filters, pagination, view profile, approve, reject
      (with reason), block, unblock, suspend, reactivate — all backed by the endpoints above
- [x] Admin Courses page: create, edit, and publish/draft/archive courses (soft-delete only —
      no hard delete), with search, status filter, and pagination
- [x] Admin Batches page: create/edit batches (course, trainer, schedule, mode, capacity),
      publish/cancel/complete status transitions, and a student roster dialog (search active
      students, enroll, remove) — capacity and duplicate-enrollment are enforced server-side
- [x] Admin Fees page: per-student fee status (final fee − discount, paid, due, computed status)
      and a payment ledger, with a "Record payment" flow that validates the student is actually
      enrolled in the chosen batch
- [x] Admin Placements page: post/edit jobs, publish/close, and an applications dialog for
      moving each applicant through the pipeline (applied → ... → selected/rejected)
- [x] Admin Announcements page: publish to everyone/students/trainers/a batch/a course, with
      priority and an optional expiry date
- [x] Admin Audit Logs page: read-only feed of every admin action recorded above
- [x] Modules/Lessons: curriculum management nested under each course, with drag-free up/down
      reordering for both modules and lessons within a module
- [ ] Full Reports module — deferred: meaningful attendance/course-completion reports need the
      Attendance and Task models from Phase 5/6, which don't exist yet. Building it now would
      mean either fake data or an empty shell, so it's left for after those phases land.

Not built yet (later phases — see the full spec for detail):

- [ ] Trainer: batches, schedule, materials, tasks, submissions, attendance, mock interviews
- [ ] Student: course progress, materials, tasks, attendance, jobs, fees, certificates
- [ ] Notifications (in-app + email), announcements, audit log UI
- [ ] File storage abstraction (local dev → S3/Cloudinary-compatible in production)
- [ ] Automated tests (auth/authorization boundaries especially)

## Production checklist (partial — grows with each phase)

- [ ] Replace the generated JWT secrets in `backend/.env` before deploying
- [ ] Point `MONGODB_URI` at a real Atlas cluster
- [ ] Configure a real SMTP/SES/SendGrid provider in `email.service.ts`
- [ ] Set `CLIENT_URL` (backend) and `NEXT_PUBLIC_API_URL` (frontend) to their production origins
- [ ] Serve the frontend over Vercel and the backend over Render/Railway/a VPS, each with HTTPS
