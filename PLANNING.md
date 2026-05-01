# e-Governance Grievance Redressal & Tracking System — Planning Document

> **Status:** Pre-development planning document. All implementation must follow this spec.

---

## 0.1 System Architecture

### Three-Tier Architecture

#### Presentation Layer — React.js Frontend
- **Responsibility:** Renders all user-facing UI; manages client-side routing, form handling,
  local session state, and role-based page access.
- **Communication Method:** HTTP requests (via Axios) to the PHP REST API, consuming and
  sending JSON payloads. Authentication tokens/session IDs are stored in `localStorage` and
  attached to every API request.
- **Key concerns:** Route guards for unauthorized access, loading/error states on every API call,
  no business logic hardcoded — all data comes from the API.

#### Application Layer — PHP REST API Backend
- **Responsibility:** Validates input, enforces role-based access control, executes database
  queries via PDO, formats JSON responses.
- **API Design Principles:** RESTful; each endpoint is a single PHP file; consistent
  `{ "status": "success"|"error", "data": {...}|"message": "..." }` envelope; CORS headers set
  for the React dev server.
- **Authentication:** Token-based (UUID tokens stored in `user_tokens` table). On login, a token
  is generated and returned to the frontend. Every protected endpoint validates the token from
  the `Authorization: Bearer <token>` request header, then checks the user's role.

#### Data Layer — MySQL Database
- **Responsibility:** Durable persistence of all application data. Enforces referential integrity
  via foreign keys. Provides indexed lookups for complaints by status, department, citizen, etc.
- **Data Persistence Strategy:** All writes go through the PHP layer (no direct DB access from
  frontend). PDO with prepared statements is used throughout to prevent SQL injection.

### Inter-Layer Communication
```
Browser (React)  ←→  HTTP/JSON (REST)  ←→  PHP API  ←→  MySQL (PDO)
```
- Frontend → Backend: Axios sends `Content-Type: application/json` requests.
- Backend → Frontend: PHP returns `Content-Type: application/json` responses.
- Backend → DB: PDO with prepared statements.

---

## 0.2 Database Schema

### Table: `users`
| Column | Type | Constraints |
|---|---|---|
| `id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT |
| `name` | VARCHAR(150) | NOT NULL |
| `email` | VARCHAR(200) | NOT NULL, UNIQUE |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `role` | ENUM('citizen','officer','admin') | NOT NULL, DEFAULT 'citizen' |
| `department_id` | INT UNSIGNED | NULL, FK → departments(id) |
| `is_active` | TINYINT(1) | NOT NULL, DEFAULT 1 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### Table: `departments`
| Column | Type | Constraints |
|---|---|---|
| `id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT |
| `name` | VARCHAR(150) | NOT NULL, UNIQUE |
| `description` | TEXT | NULL |
| `is_active` | TINYINT(1) | NOT NULL, DEFAULT 1 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### Table: `complaints`
| Column | Type | Constraints |
|---|---|---|
| `id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT |
| `citizen_id` | INT UNSIGNED | NOT NULL, FK → users(id) |
| `department_id` | INT UNSIGNED | NOT NULL, FK → departments(id) |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `status` | ENUM('Submitted','Under Review','In Progress','Resolved','Rejected') | NOT NULL, DEFAULT 'Submitted' |
| `priority` | ENUM('Low','Medium','High') | NOT NULL, DEFAULT 'Medium' |
| `reference_number` | VARCHAR(20) | NOT NULL, UNIQUE |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

### Table: `complaint_updates`
| Column | Type | Constraints |
|---|---|---|
| `id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT |
| `complaint_id` | INT UNSIGNED | NOT NULL, FK → complaints(id) ON DELETE CASCADE |
| `updated_by` | INT UNSIGNED | NOT NULL, FK → users(id) |
| `old_status` | ENUM('Submitted','Under Review','In Progress','Resolved','Rejected') | NULL |
| `new_status` | ENUM('Submitted','Under Review','In Progress','Resolved','Rejected') | NULL |
| `remarks` | TEXT | NULL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### Table: `user_tokens`
| Column | Type | Constraints |
|---|---|---|
| `id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT |
| `user_id` | INT UNSIGNED | NOT NULL, FK → users(id) ON DELETE CASCADE |
| `token` | VARCHAR(64) | NOT NULL, UNIQUE |
| `expires_at` | TIMESTAMP | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### Relationships
- `users.department_id` → `departments.id` (officers belong to one department)
- `complaints.citizen_id` → `users.id`
- `complaints.department_id` → `departments.id`
- `complaint_updates.complaint_id` → `complaints.id` (CASCADE DELETE)
- `complaint_updates.updated_by` → `users.id`
- `user_tokens.user_id` → `users.id` (CASCADE DELETE)

---

## 0.3 Module Structure

| Module | Responsibility |
|---|---|
| **Authentication Module** | Register citizen accounts; login for all roles; logout; token validation middleware for all protected endpoints |
| **Complaint Submission Module** | Citizens submit new complaints; auto-generate reference numbers; validate required fields |
| **Citizen Dashboard Module** | Listing all complaints by the logged-in citizen; filtering by status; viewing complaint detail with full history |
| **Officer Dashboard Module** | View all complaints routed to the officer's department; update complaint status; add remarks/progress notes |
| **Admin Dashboard Module** | View all complaints across departments; view system statistics (total, by status, by department) |
| **Department Management Module** | CRUD operations for departments; admin only |
| **Officer Management Module** | Admin creates/updates/deletes officer accounts; assigns officers to departments |
| **Reporting Module** | Generate department-wise complaint counts; monthly breakdown charts/tables; admin only |

---

## 0.4 API Structure

All endpoints are under `backend/api/`.  
All requests to protected endpoints must include header: `Authorization: Bearer <token>`

### Authentication

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| POST | `/api/auth/register.php` | No | — | Register new citizen |
| POST | `/api/auth/login.php` | No | — | Login, returns token + user info |
| POST | `/api/auth/logout.php` | Yes | All | Invalidate token |
| GET | `/api/auth/me.php` | Yes | All | Get current user info |

**POST /api/auth/register.php**
- Request: `{ "name": "string", "email": "string", "password": "string" }`
- Response success: `{ "status": "success", "data": { "user_id": 1, "name": "...", "role": "citizen" } }`
- Response error: `{ "status": "error", "message": "Email already registered" }`

**POST /api/auth/login.php**
- Request: `{ "email": "string", "password": "string" }`
- Response success: `{ "status": "success", "data": { "token": "...", "user": { "id":1, "name":"...", "role":"citizen", "department_id": null } } }`
- Response error: `{ "status": "error", "message": "Invalid credentials" }`

### Complaints

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| POST | `/api/complaints/create.php` | Yes | citizen | Submit new complaint |
| GET | `/api/complaints/list.php` | Yes | citizen | List own complaints |
| GET | `/api/complaints/list.php` | Yes | officer | List dept complaints |
| GET | `/api/complaints/list.php` | Yes | admin | List all complaints |
| GET | `/api/complaints/detail.php?id={id}` | Yes | All | Get complaint detail + updates |
| PUT | `/api/complaints/update_status.php` | Yes | officer, admin | Update status + remark |

**POST /api/complaints/create.php**
- Request: `{ "department_id": 1, "title": "...", "description": "...", "priority": "Medium" }`
- Response: `{ "status": "success", "data": { "complaint_id": 5, "reference_number": "GRV-20260001" } }`

**GET /api/complaints/list.php**
- Optional query params: `?status=Submitted&department_id=2&page=1&limit=20`
- Response: `{ "status": "success", "data": { "complaints": [...], "total": 42, "page": 1 } }`

**PUT /api/complaints/update_status.php**
- Request: `{ "complaint_id": 5, "new_status": "In Progress", "remarks": "..." }`
- Response: `{ "status": "success", "data": { "complaint_id": 5, "new_status": "In Progress" } }`

### Departments

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| GET | `/api/departments/list.php` | Yes | All | List all active departments |
| POST | `/api/departments/create.php` | Yes | admin | Create department |
| PUT | `/api/departments/update.php` | Yes | admin | Update department |
| DELETE | `/api/departments/delete.php` | Yes | admin | Soft-delete department |
| GET | `/api/departments/detail.php?id={id}` | Yes | admin | Get department detail |

### Officers

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| GET | `/api/officers/list.php` | Yes | admin | List all officers |
| POST | `/api/officers/create.php` | Yes | admin | Create officer account |
| PUT | `/api/officers/update.php` | Yes | admin | Update officer |
| DELETE | `/api/officers/delete.php` | Yes | admin | Deactivate officer |

### Reports

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| GET | `/api/reports/summary.php` | Yes | admin | Overall stats (total, by status) |
| GET | `/api/reports/by_department.php` | Yes | admin | Complaints per department |
| GET | `/api/reports/monthly.php` | Yes | admin | Monthly complaint counts (last 12 months) |

---

## 0.5 Frontend Page and Component Structure

### Pages

| Page | Route | Role | API Calls |
|---|---|---|---|
| **LandingPage** | `/` | Public | None |
| **LoginPage** | `/login` | Public | POST `/api/auth/login.php` |
| **RegisterPage** | `/register` | Public (citizen) | POST `/api/auth/register.php` |
| **CitizenDashboard** | `/citizen/dashboard` | citizen | GET `/api/complaints/list.php` |
| **SubmitComplaint** | `/citizen/submit` | citizen | GET `/api/departments/list.php`, POST `/api/complaints/create.php` |
| **ComplaintDetail** | `/citizen/complaint/:id` | citizen | GET `/api/complaints/detail.php?id={id}` |
| **OfficerDashboard** | `/officer/dashboard` | officer | GET `/api/complaints/list.php` |
| **OfficerComplaintDetail** | `/officer/complaint/:id` | officer | GET `/api/complaints/detail.php?id={id}`, PUT `/api/complaints/update_status.php` |
| **AdminDashboard** | `/admin/dashboard` | admin | GET `/api/reports/summary.php`, GET `/api/complaints/list.php` |
| **AdminDepartments** | `/admin/departments` | admin | GET/POST/PUT/DELETE `/api/departments/*.php` |
| **AdminOfficers** | `/admin/officers` | admin | GET/POST/PUT/DELETE `/api/officers/*.php` |
| **AdminReports** | `/admin/reports` | admin | GET `/api/reports/*.php` |

### Reusable Components

| Component | Description |
|---|---|
| `Header` | Top nav bar with portal name, user name, role badge, logout button |
| `Sidebar` | Role-specific navigation links |
| `Layout` | Wraps Header + Sidebar + main content area |
| `ComplaintTable` | Bordered, striped table for complaint listings |
| `StatusBadge` | Colored pill for complaint status |
| `PriorityBadge` | Colored pill for complaint priority |
| `StatCard` | Summary stat card for dashboards |
| `LoadingSpinner` | Full-area loading state indicator |
| `ErrorAlert` | User-friendly error message box |
| `ConfirmModal` | Reusable confirmation dialog |
| `ProtectedRoute` | HOC that redirects unauthenticated/unauthorized users |

---

## 0.6 Repository Folder Structure

```
eGov/
├── PLANNING.md
├── README.md
├── database/
│   ├── schema.sql
│   └── seed.sql
├── frontend/                        ← Vite + React application
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             ← Axios instance + interceptors
│   │   ├── context/
│   │   │   └── AuthContext.jsx      ← Auth state, login/logout helpers
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── ComplaintTable.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── PriorityBadge.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorAlert.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── citizen/
│   │   │   │   ├── CitizenDashboard.jsx
│   │   │   │   ├── SubmitComplaint.jsx
│   │   │   │   └── ComplaintDetail.jsx
│   │   │   ├── officer/
│   │   │   │   ├── OfficerDashboard.jsx
│   │   │   │   └── OfficerComplaintDetail.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminDepartments.jsx
│   │   │       ├── AdminOfficers.jsx
│   │   │       └── AdminReports.jsx
│   │   ├── styles/
│   │   │   └── index.css            ← Global government-portal CSS
│   │   └── App.jsx                  ← Routes definition
│   ├── index.html
│   └── package.json
└── backend/
    ├── .htaccess
    └── api/
        ├── config/
        │   └── db.php               ← PDO connection + CORS headers helper
        ├── auth/
        │   ├── register.php
        │   ├── login.php
        │   ├── logout.php
        │   └── me.php
        ├── complaints/
        │   ├── create.php
        │   ├── list.php
        │   ├── detail.php
        │   └── update_status.php
        ├── departments/
        │   ├── list.php
        │   ├── create.php
        │   ├── update.php
        │   ├── delete.php
        │   └── detail.php
        ├── officers/
        │   ├── list.php
        │   ├── create.php
        │   ├── update.php
        │   └── delete.php
        └── reports/
            ├── summary.php
            ├── by_department.php
            └── monthly.php
```

---

## 0.7 Development Roadmap — Four Phases

### Phase 1: Foundation — Database, Authentication & Project Scaffold
**Goals:** Get the project structure in place, the database defined, and all authentication flows working end-to-end.

**Features & Components:**
- Initialize Git repository
- Create folder structure (frontend Vite + React, backend PHP)
- Write `database/schema.sql` and `database/seed.sql`
- Implement all auth PHP endpoints: `register.php`, `login.php`, `logout.php`, `me.php`
- Build `db.php` (PDO connection, CORS headers, auth middleware function)
- Bootstrap React app (Vite): routing, global CSS, AuthContext
- Build `ProtectedRoute`, `Header`, `Sidebar`, `Layout`, `LoadingSpinner`, `ErrorAlert` components
- Build `LoginPage` and `RegisterPage` (citizen self-registration)
- Role-based redirect after login (citizen → /citizen/dashboard, officer → /officer/dashboard, admin → /admin/dashboard)
- Placeholder dashboard pages (showing "Welcome, [Name]") purely to verify routing works
- Global navigation with logout

**Deliverable:** A working login/register/logout flow. Any role can log in, see a role-appropriate placeholder page, and log out. Database and API are live.

**Commit Message:** `Phase 1 Complete: Project scaffold, database schema, authentication API and UI`

---

### Phase 2: Core Complaint Features — Citizen & Officer Flows
**Goals:** Full complaint lifecycle for citizens (submit, view, track) and officers (view, update status).

**Features & Components:**
- PHP: `complaints/create.php`, `complaints/list.php`, `complaints/detail.php`, `complaints/update_status.php`
- PHP: `departments/list.php` (needed for submission form dropdown)
- React: `SubmitComplaint` page (form with department picker, title, description, priority)
- React: `CitizenDashboard` — list own complaints with `ComplaintTable`, `StatusBadge`, `PriorityBadge`
- React: `ComplaintDetail` (citizen view) — complaint info + full update history timeline
- React: `OfficerDashboard` — list department's complaints, filter by status
- React: `OfficerComplaintDetail` — view complaint + form to update status and add remarks
- Reference number generation (format: `GRV-YYYY####`)
- Pagination on complaint lists

**Deliverable:** Citizens can submit and track complaints. Officers can view and update complaint statuses end-to-end. No admin features yet.

**Commit Message:** `Phase 2 Complete: Complaint submission, citizen dashboard, officer dashboard and status updates`

---

### Phase 3: Admin Management — Departments, Officers & Admin Dashboard
**Goals:** Full admin control plane: manage departments, manage officer accounts, view all complaints.

**Features & Components:**
- PHP: `departments/create.php`, `departments/update.php`, `departments/delete.php`, `departments/detail.php`
- PHP: `officers/list.php`, `officers/create.php`, `officers/update.php`, `officers/delete.php`
- React: `AdminDashboard` — `StatCard` summary (total complaints, by status), recent complaints table
- React: `AdminDepartments` — CRUD table with add/edit modal and delete confirmation
- React: `AdminOfficers` — CRUD table with add/edit modal, department assignment dropdown
- `ConfirmModal` component for delete actions
- Admin can view all complaints (read-only) and drill into `ComplaintDetail`

**Deliverable:** Admin can fully manage departments and officers. Admin dashboard shows live system statistics.

**Commit Message:** `Phase 3 Complete: Admin dashboard, department management, officer management`

---

### Phase 4: Reporting, UI Polish & Production-Ready Finish
**Goals:** Reports module, full government-portal visual polish, error handling improvements, README.

**Features & Components:**
- PHP: `reports/summary.php`, `reports/by_department.php`, `reports/monthly.php`
- React: `AdminReports` page — dept-wise table, monthly breakdown table, stat summary
- UI polish pass on ALL pages: typography, spacing, color palette, consistent status badges, table striping, form card styling, responsive sidebars
- `LandingPage` — public home page with portal introduction
- Comprehensive error handling improvements across all pages
- Navigation enhancements (active link highlighting, breadcrumbs on detail pages)
- `README.md` with full setup instructions, default credentials, phase summary
- Final end-to-end test pass

**Deliverable:** Fully functional, polished system that looks like a professional government service portal. All four roles operational, all reports live, README complete.

**Commit Message:** `Phase 4 Complete: Reports module, UI polish, landing page, README — Project complete`

---

## Verification Plan

### Per-Phase Verification

**Phase 1:**
1. Run `database/schema.sql` and `database/seed.sql` against MySQL — verify 0 errors.
2. Test `POST /api/auth/login.php` via browser devtools or curl with seed admin credentials.
3. Open React app at `http://localhost:5173`, log in as each seeded role, verify redirect to correct placeholder dashboard.
4. Log out — verify redirect to `/login`.

**Phase 2:**
1. Log in as citizen → submit a complaint → verify it appears in dashboard list.
2. Log in as officer → verify only department's complaints are visible → update status → verify status badge changes.
3. Open complaint detail as citizen → verify update history timeline shows officer's remark.

**Phase 3:**
1. Log in as admin → create a new department → verify appears in departments list.
2. Create a new officer assigned to that department → log in as that officer → verify dashboard loads their complaints.
3. Admin dashboard stat cards should reflect real DB counts.

**Phase 4:**
1. Admin → Reports page → verify department-wise counts match DB.
2. Admin → Reports page → monthly table shows data for last 12 months.
3. Visual inspection: check all pages match government-portal design standards.
4. All navigation links functional, no broken routes.
