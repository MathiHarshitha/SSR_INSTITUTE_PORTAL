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
CORS, express-rate-limit, Multer, Cloudinary.

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

File uploads (Materials, Task submissions) need a free [Cloudinary](https://cloudinary.com) account —
set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `backend/.env`
(from the Cloudinary dashboard's API keys page). Without them, `POST /uploads` fails with a clear
"file storage is not configured" error instead of a silent failure — everything else in the app
works fine without it.

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

### Uploads (`/uploads`) — any authenticated user

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST   | `/`  | ADMIN, TRAINER, STUDENT | multipart/form-data: `file`, `folder?` — streams to Cloudinary (25MB cap, server-side MIME allowlist), returns `{ url, publicId, resourceType, format, bytes, originalName }` |

The returned `url` is only ever meaningful once attached to a record the caller is already
authorized to create (a material, a submission) — the upload endpoint itself doesn't know or care
what the file is for.

### Materials (`/materials`) — ADMIN, TRAINER

Trainers are scoped to their own batches automatically (`assertBatchAccess`); admins see everything.

| Method | Path   | Body |
|--------|--------|------|
| GET    | `/`    | query: page, limit, batch, module, search |
| POST   | `/`    | title, fileUrl, fileType, batch, description?, module? |
| PATCH  | `/:id` | any subset of the create fields |
| DELETE | `/:id` | – |

### Class Schedule (`/classes`) — ADMIN, TRAINER

| Method | Path   | Body |
|--------|--------|------|
| GET    | `/`    | query: batch, from, to |
| POST   | `/`    | batch, date, startTime, endTime, topic, module?, description?, meetingLink?, location? |
| PATCH  | `/:id` | any subset of the create fields |
| DELETE | `/:id` | – |

### Attendance (`/attendance`) — ADMIN, TRAINER

| Method | Path                  | Body |
|--------|-----------------------|------|
| GET    | `/`                   | query: batch, student, date, from, to |
| POST   | `/mark`               | batch, date, records: [{ student, status, notes? }] — upserts per (student, batch, date), so re-marking edits in place instead of creating duplicates |
| GET    | `/summary/:batchId`   | – (per-student total/present/absent/late/leave + percentage) |

### Tasks (`/tasks`)

| Method | Path                       | Auth              | Body |
|--------|----------------------------|-------------------|------|
| GET    | `/`                        | ADMIN, TRAINER    | query: batch, status, type |
| POST   | `/`                        | ADMIN, TRAINER    | discriminated on `type`: ASSIGNMENT / QUIZ (questions[]) / PROJECT — see `task.validator.ts` |
| GET    | `/:id`                     | ADMIN, TRAINER    | – |
| PATCH  | `/:id`                     | ADMIN, TRAINER    | any subset of the type's fields |
| PATCH  | `/:id/status`              | ADMIN, TRAINER    | status: DRAFT \| PUBLISHED \| CLOSED |
| DELETE | `/:id`                     | ADMIN, TRAINER    | – (DRAFT only — publish/close instead of deleting a live task) |
| GET    | `/:taskId/submissions`     | ADMIN, TRAINER    | – |
| GET    | `/:taskId/my-submission`   | STUDENT           | – |
| POST   | `/:taskId/submit`          | STUDENT           | content?, fileUrl?, comments? (rejects if not enrolled in the task's batch; auto-flags LATE past the due date) |

### Submissions (`/submissions`)

| Method | Path                       | Auth           | Body |
|--------|----------------------------|----------------|------|
| GET    | `/pending`                 | ADMIN, TRAINER | – (all SUBMITTED/LATE submissions across the trainer's batches, oldest first) |
| PATCH  | `/:submissionId/evaluate`  | ADMIN, TRAINER | marks, feedback? (rejects marks over the task's maxMarks) |

### Mock Interviews (`/interviews`)

| Method | Path             | Auth                    | Body |
|--------|------------------|-------------------------|------|
| GET    | `/`              | any authenticated user  | Trainers see only interviews they're interviewing; students see only their own; admins can filter by student/interviewer |
| POST   | `/`              | ADMIN, TRAINER          | student, date, time, type, batch?, meetingLink?, topics?, notes? |
| PATCH  | `/:id`           | ADMIN, TRAINER          | any subset of the schedule fields |
| PATCH  | `/:id/feedback`  | ADMIN, TRAINER          | rating, result, strengths?, weaknesses?, feedback?, recommendation? |
| DELETE | `/:id`           | ADMIN, TRAINER          | – |

### Dashboards (`/dashboard`)

| Method | Path        | Auth    | Body |
|--------|-------------|---------|------|
| GET    | `/trainer`  | TRAINER | – (assignedBatches, totalStudents, todaysClasses, pendingEvaluations, upcomingInterviews, recentAnnouncements) |
| GET    | `/student`  | STUDENT | – (enrollment, courseProgress, attendancePercentage, pendingTasksCount, upcomingClasses, upcomingInterviews, feeDue, recentAnnouncements, recentGrades) |

### Course Progress (`/progress`) — STUDENT only

| Method | Path                          | Body |
|--------|-------------------------------|------|
| GET    | `/courses/:courseId`          | – (overall %, per-module %, per-lesson completed flag) |
| POST   | `/lessons/:lessonId/complete` | – |
| DELETE | `/lessons/:lessonId/complete` | – |

### Student read access on existing modules

These reuse the same routes documented above, with `STUDENT` added to `authorize(...)` and scoped
to the student's own enrolled batches (never another student's):

| Module      | Route(s)                                    | Student-specific behavior |
|-------------|----------------------------------------------|----------------------------|
| Materials   | `GET /materials`                              | scoped to enrolled batches |
| Schedule    | `GET /classes`                                | scoped to enrolled batches |
| Tasks       | `GET /tasks`, `GET /tasks/:id`                | never returns DRAFT tasks; each task includes the student's own `mySubmission` |
| Attendance  | `GET /attendance`, `GET /attendance/summary/:batchId` | always forced to the requester's own student id, regardless of query params |
| Fees        | `GET /fees/my-status`, `GET /fees/my-payments` | own records only |

### Jobs — student side (`/jobs`)

| Method | Path                                    | Body |
|--------|-------------------------------------------|------|
| GET    | `/public`                                 | – (published, non-expired jobs with `isEligible` and `applicationStatus` computed) |
| POST   | `/:id/apply`                              | resumeUrl? (rejects if not PUBLISHED, deadline passed, or already applied) |
| GET    | `/applications/me`                        | – |
| POST   | `/applications/:applicationId/withdraw`   | – (blocked once SELECTED/REJECTED/WITHDRAWN) |

### Certificates (`/certificates`)

| Method | Path                       | Auth    | Body |
|--------|----------------------------|---------|------|
| GET    | `/verify/:certificateNumber` | –     | – (public — name/course/batch/issue date/status only, no other student data) |
| GET    | `/my`                      | STUDENT | – |
| GET    | `/`                        | ADMIN   | query: page, limit, search, status, batch |
| POST   | `/`                        | ADMIN   | student, batch (batch must be COMPLETED; student must be enrolled in it; rejects a duplicate active certificate for the same student+batch) |
| GET    | `/:id`                     | ADMIN   | – |
| PATCH  | `/:id/revoke`              | ADMIN   | reason? |

Certificates are never hard-deleted or edited after issuance — `PATCH /:id/revoke` is the only state
change, and a revoked certificate still resolves on the public verify page (status `REVOKED`) rather
than 404ing, so a forged or expired claim reads as invalid instead of merely unknown. Student name,
course name, and batch name are copied onto the certificate at issue time rather than populated live,
so verification never depends on — or leaks — the live `User`/`Course`/`Batch` documents.

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

Built so far (Phase 5, complete):

- [x] Trainer Dashboard: assigned batches, total students, today's classes, pending evaluations,
      upcoming interviews, and recent announcements — one aggregation endpoint, no hardcoded numbers
- [x] My Batches: read-only view of a trainer's own assigned batches with a student roster and
      per-student attendance % (enforced server-side — a trainer can never see another trainer's
      batch, verified with a live cross-trainer 403 test)
- [x] Class Schedule: create/edit/delete classes per batch, upcoming/past split
- [x] Materials: upload notes/videos/links (as URLs — real file storage is still a later infra
      phase) tagged to a course module, searchable and filterable by batch
- [x] Tasks: create Assignments, Quizzes (MCQ builder), and Projects; publish/close lifecycle;
      students can submit (needed to make evaluation testable); trainers evaluate with a
      server-enforced marks-cannot-exceed-max-marks check
- [x] Submissions: both a per-task view and a cross-batch "pending evaluations" queue
- [x] Attendance: mark a whole batch for a date in one action, upsert-based so re-marking edits
      in place rather than creating duplicates (verified live), plus a live percentage summary
- [x] Mock Interviews: schedule, and record rating/strengths/weaknesses/feedback/result

Every batch-scoped endpoint above (materials, schedule, attendance, tasks, submissions) shares one
authorization helper (`assertBatchAccess`) that re-fetches the batch and checks its stored trainer
against the requester — never trusting a role or id the client sends.

Built so far (Phase 6, complete):

- [x] Course Progress: a new `LessonProgress` model (nothing tracked completion before this) +
      per-module and overall percentage computed from completed/total lessons; students toggle
      lessons complete/incomplete from `/student/course` (verified live: 0% → 50% after completing
      1 of 2 lessons)
- [x] Student Dashboard: course progress, attendance %, pending tasks, upcoming classes, upcoming
      interviews, fee due, recent announcements, recent grades — one aggregation endpoint, every
      number cross-checked live against the individual endpoints it's built from
- [x] Materials, Class Schedule, Tasks, Attendance: read access opened to STUDENT, scoped to their
      own enrolled batches via the same `assertBatchAccess` helper trainers use (extended to check
      enrollment, not just trainer assignment) — a student querying a batch they're not enrolled in
      gets a real 403, verified live with a second student account
- [x] Tasks: students see only PUBLISHED/CLOSED tasks (never DRAFT) plus their own submission
      status per task; can submit/update a submission until it's evaluated
- [x] Attendance: a student's own view and summary are filtered to their own row only — never
      classmates' records, even though the underlying aggregation computes all of them
- [x] Mock Interviews: read-only, already scoped by role from Phase 5 (no changes needed)
- [x] Jobs & Applications (completing Phase 8): students browse published jobs with eligibility
      computed from course match + overall attendance %, apply (blocked on duplicate/expired/
      unpublished), track status, and withdraw — verified live including the 409 on double-apply
- [x] Fees (completing Phase 7 for students): read-only own fee status and payment history,
      reusing the same live-computed status logic admins see

Built so far (Phase 9, complete):

- [x] Certificate model + issuance: admin picks a COMPLETED batch and an enrolled student; server
      generates a unique certificate number (`SSR-{year}-{random}`) and denormalizes student/course/
      batch names onto the record at issue time
- [x] Server-side eligibility checks: batch must be COMPLETED, student must actually be enrolled in
      it, and issuing a second active certificate for the same student+batch is rejected (409) —
      verified live end-to-end (issue → duplicate-reject → revoke → re-verify)
- [x] Admin Certificates page: search/filter/paginate, issue via a batch→student picker (mirrors the
      Fees "record payment" flow), revoke with an optional reason
- [x] Student Certificates page: read-only list of the student's own certificates with a link to the
      public verification page for each
- [x] Public certificate verification (`/verify-certificate/[certificateId]`, no login required):
      resolves a certificate number to name/course/batch/issue date/status; a revoked certificate
      still resolves (status `REVOKED`) rather than 404ing, so it reads as invalid rather than unknown

Built so far (file storage, complete):

- [x] Real file uploads via Cloudinary: a single authenticated `POST /uploads` endpoint (multer,
      in-memory, 25MB cap, server-side MIME allowlist) streams the file to Cloudinary and returns
      its URL — no local disk storage, so it works the same in dev and in production
- [x] Materials: uploading a DOCUMENT/VIDEO/IMAGE/OTHER file now goes through the upload endpoint;
      the LINK type still takes a plain URL, since a link to external material isn't a file to store
- [x] Task submissions: students can upload a file the same way, or still paste a link (GitHub repo,
      etc.) — both land in the same `fileUrl` field, unchanged on the backend
- [x] `FileUploadField` (frontend, shared) pairs a URL input with an upload button so both flows
      above share one component instead of duplicating the upload wiring
- [ ] Not yet wired to profile pictures, course thumbnails, or job-application resumes — those still
      take a plain URL; the same endpoint/component can be reused there without further backend work

Not built yet (later phases — see the full spec for detail):

- [ ] Full Reports module (Phase 10) — deferred, see the Phase 3 note above
- [ ] Notifications (in-app + email) — the email service abstraction exists but isn't wired to
      these new events (task published, submission evaluated, interview scheduled, etc.) yet
- [ ] Automated tests (auth/authorization boundaries especially)

## Production checklist (partial — grows with each phase)

- [ ] Replace the generated JWT secrets in `backend/.env` before deploying
- [ ] Point `MONGODB_URI` at a real Atlas cluster
- [ ] Configure a real SMTP/SES/SendGrid provider in `email.service.ts`
- [ ] Set `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` in `backend/.env`
- [ ] Set `CLIENT_URL` (backend) and `NEXT_PUBLIC_API_URL` (frontend) to their production origins
- [ ] Serve the frontend over Vercel and the backend over Render/Railway/a VPS, each with HTTPS
