# TranscriptOS

Full transcript generation workflow with **role-based authentication and route guards** for Nigerian universities.

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| UI           | React 18 + TypeScript             |
| Styling      | Tailwind CSS v3                   |
| Routing      | React Router DOM v6               |
| State        | Zustand                           |
| Auth         | Context API + localStorage session|
| HTTP Client  | Axios (proxied to /api)           |
| Mock API     | JSON Server (db.json)             |
| PDF Export   | html2pdf.js                       |
| Bundler      | Vite 5                            |
| Toasts       | react-hot-toast                   |

---

## Project Structure

```
transcript-os/
├── db.json                                    # JSON Server mock DB (users, students, courses, requests)
├── src/
│   ├── main.tsx                               # Entry — wraps app in AuthProvider
│   ├── styles/index.css                       # Tailwind + global component styles
│   │
│   ├── types/index.ts                         # All TS interfaces: User, UserRole, Course, etc.
│   │
│   ├── auth/
│   │   ├── authService.ts                     # login(), logout(), session persistence, userService
│   │   └── RouteGuards.tsx                    # RequireAuth, RequireAdmin, RequireSuperAdmin,
│   │                                          #   RequireStudent, PublicOnly
│   ├── context/
│   │   └── AuthContext.tsx                    # AuthProvider + useAuth() hook
│   │
│   ├── router/
│   │   └── index.tsx                          # Role-split route tree with guards applied
│   │
│   ├── store/
│   │   └── appStore.ts                        # Zustand store (student data, requests, filters)
│   │
│   ├── services/
│   │   └── api.ts                             # Axios: studentService, courseService, requestService
│   │
│   ├── hooks/index.ts                         # useGPA, useTranscript, useAdminQueue, useRequestForm
│   │
│   ├── utils/
│   │   ├── gpa.ts                             # Nigerian 5-pt scale math, classOfDegree, formatters
│   │   └── pdf.ts                             # html2pdf.js export, document ID generator
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── RoleLayouts.tsx                # StudentLayout + AdminLayout (separate nav sets)
│   │   │   └── Layout.tsx                     # (legacy, superseded by RoleLayouts)
│   │   └── ui/index.tsx                       # Badge, Modal, Spinner, FilterChip, Pagination
│   │
│   └── pages/
│       ├── auth/
│       │   └── LoginPage.tsx                  # Credential login, demo quick-fill, role redirect
│       ├── student/
│       │   ├── StudentDashboard.tsx           # CGPA, recent requests, quick actions
│       │   ├── RequestPage.tsx                # New transcript request form + validation
│       │   └── MyRequestsPage.tsx             # Status tracker, filters, pagination
│       ├── admin/
│       │   ├── AdminDashboard.tsx             # System-wide stats, recent queue, quick links
│       │   ├── AdminQueuePage.tsx             # Approve/reject/notes + search/filter
│       │   └── control-panel/
│       │       └── ControlPanel.tsx           # Superadmin: user list, role editor, status, delete
│       ├── transcript/
│       │   └── TranscriptPreviewPage.tsx      # Official document, watermark, QR, PDF/print export
│       ├── gpa/
│       │   └── GPACalculatorPage.tsx          # Semester breakdown, distribution, what-if simulator
│       ├── UnauthorizedPage.tsx               # 403 page with role-aware back link
│       └── NotFoundPage.tsx                   # 404
```

---

## Authentication & Route Guards

### Roles
| Role         | Access                                                             |
|--------------|--------------------------------------------------------------------|
| `student`    | `/student/*` only — dashboard, requests, transcript, GPA          |
| `admin`      | `/admin/*` — dashboard, queue, transcript preview, GPA lookup     |
| `superadmin` | `/admin/*` + `/admin/control-panel` — full user management        |

### Route Guards (src/auth/RouteGuards.tsx)
| Guard              | Behaviour                                                    |
|--------------------|--------------------------------------------------------------|
| `PublicOnly`       | Redirects authenticated users to their role home            |
| `RequireAuth`      | Redirects unauthenticated users to `/login`                 |
| `RequireStudent`   | Only `student` role passes; others → role home              |
| `RequireAdmin`     | `admin` + `superadmin` pass; students → `/student/dashboard`|
| `RequireSuperAdmin`| Only `superadmin`; admins → `/admin/dashboard`              |

### Session
- Stored in `localStorage` as `transcript_os_session`
- 8-hour TTL, cleared on sign-out
- Rehydrated on page refresh

---

## Control Panel (Superadmin only)

Located at `/admin/control-panel`. Features:
- Full user table with role + status badges
- **Approve** pending accounts in one click
- **Suspend / Restore** any account
- **Edit** role (student → admin → superadmin) and status via modal
- **Remove** user with confirmation modal
- Search by name or email, filter by role and status
- Superadmin cannot edit or delete their own account

---

## Nigerian Grading Scale

| Grade | Score Range | Grade Points |
|-------|-------------|--------------|
| A     | 70 – 100    | 5            |
| B     | 60 – 69     | 4            |
| C     | 50 – 59     | 3            |
| D     | 45 – 49     | 2            |
| E     | 40 – 44     | 1            |
| F     | 0 – 39      | 0            |

CGPA = Σ(Grade Points × Units) / Σ(Units)

---

## Getting Started

```bash
npm install
npm run dev        # Vite (5173) + JSON Server (3001) via concurrently
```

### Demo Accounts

| Email                          | Password       | Role        |
|--------------------------------|----------------|-------------|
| superadmin@abu.edu.ng          | superadmin123  | superadmin  |
| admin@abu.edu.ng               | admin123       | admin       |
| buhari@student.abu.edu.ng      | student123     | student     |
| aisha@student.abu.edu.ng       | student123     | student     |

All accounts are available as quick-fill buttons on the login screen.

---

## Account States

| Status             | Meaning                                          |
|--------------------|--------------------------------------------------|
| `active`           | Can log in normally                              |
| `pending_approval` | Registered but blocked — superadmin must approve |
| `suspended`        | Temporarily blocked — superadmin can restore     |

