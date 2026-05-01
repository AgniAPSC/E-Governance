# e-Governance Grievance Redressal & Tracking System

A full-stack web application that simulates a **State Government Grievance Portal**, enabling citizens to submit complaints to government departments and track their resolution, while department officers and administrators manage and monitor complaints through dedicated dashboards.

---

## Technology Stack

| Layer       | Technology                       |
|-------------|----------------------------------|
| Frontend    | React.js (Vite), React Router v6, Axios |
| Backend     | PHP 7.4+ (REST API, PDO)         |
| Database    | MySQL 5.7+                       |
| Server      | Apache (XAMPP / WAMP)            |
| Styling     | Vanilla CSS (Government Portal Design System) |

---

## Local Setup Instructions

### Prerequisites
- **XAMPP** (or WAMP) with Apache + MySQL running
- **Node.js** v18+ and npm
- **Git**

---

### Step 1: Clone / Place the Project
Place the `eGov/` folder inside your XAMPP **htdocs** directory:
```
C:\xampp\htdocs\eGov\
```

---

### Step 2: Set Up the Database

1. Start **XAMPP Control Panel** → Start **Apache** and **MySQL**.
2. Open [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Click **Import** → Select `eGov/database/schema.sql` → Click **Go**
4. After schema is created, **Import** again with `eGov/database/seed.sql` → Click **Go**

Or via MySQL CLI:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p egov_grievance < database/seed.sql
```

---

### Step 3: Configure Database Credentials

Open `backend/api/config/db.php` and set your database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'egov_grievance');
define('DB_USER', 'root');      // your MySQL username
define('DB_PASS', '');          // your MySQL password
```

---

### Step 4: Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at **http://localhost:5173**

The Vite dev proxy forwards `/api/` requests to `http://localhost/eGov/backend/api/`, so Apache must be running with the project in `htdocs/eGov/`.

---

## Default Login Credentials

All accounts use password: **`password123`**

| Role          | Email                       | Password    |
|---------------|-----------------------------|-------------|
| Administrator | admin@egov.gov              | password123 |
| Officer (PWD) | officer.pwd@egov.gov        | password123 |
| Officer (Water)| officer.water@egov.gov     | password123 |
| Officer (Revenue)| officer.revenue@egov.gov | password123 |
| Citizen        | priya.nair@example.com     | password123 |
| Citizen        | farhan.m@example.com        | password123 |
| Citizen        | kavya.reddy@example.com     | password123 |

---

## User Roles & Features

### 🧑 Citizen
- Register and log in
- Submit complaints (select department, title, description, priority)
- View personal complaint dashboard
- Track complaint status history (full timeline)

### 👤 Officer
- View all complaints assigned to their department
- Filter complaints by status
- Update complaint status: Submitted → Under Review → In Progress → Resolved
- Add remarks/progress notes at each step

### 🛡 Administrator
- View system dashboard with live statistics
- Full CRUD for government **Departments**
- Full CRUD for **Officer** accounts (create, assign department, deactivate)
- View all complaints across all departments
- Generate reports:
  - Department-wise complaint breakdown
  - Monthly complaint trend (last 12 months) with resolution rates

---

## Four-Phase Development Summary

| Phase | Title | Deliverable |
|---|---|---|
| **Phase 0** | Planning | `PLANNING.md` committed — full architecture, schema, API, and component specs |
| **Phase 1** | Foundation | Database schema + seed SQL, all PHP API endpoints (auth, complaints, departments, officers, reports), React scaffold (Vite, AuthContext, routing, Layout, shared components, Login/Register/Landing pages) |
| **Phase 2** | Core Complaint Flows | Citizen pages (dashboard, submit complaint, complaint detail/tracking), Officer pages (department queue dashboard, complaint detail with status update form) |
| **Phase 3** | Admin Management | Admin dashboard (stats, recent activity), Department CRUD management, Officer CRUD management with department assignment |
| **Phase 4** | Reports & Polish | Admin reports page (department-wise + monthly breakdown), README, final CSS polish and consistency pass |

---

## Folder Structure

```
eGov/
├── PLANNING.md              ← Pre-development planning document
├── README.md                ← This file
├── database/
│   ├── schema.sql           ← Full database creation script
│   └── seed.sql             ← Sample data (5 departments, 7 users, 8 complaints)
├── frontend/                ← React (Vite) application
│   ├── src/
│   │   ├── api/             ← Axios instance with auth interceptors
│   │   ├── context/         ← AuthContext (login, logout, session restore)
│   │   ├── components/      ← Shared: Header, Sidebar, Layout, ComplaintTable,
│   │   │                       StatusBadge, PriorityBadge, StatCard, ConfirmModal, etc.
│   │   ├── pages/
│   │   │   ├── LandingPage, LoginPage, RegisterPage
│   │   │   ├── citizen/     ← CitizenDashboard, SubmitComplaint, ComplaintDetail
│   │   │   ├── officer/     ← OfficerDashboard, OfficerComplaintDetail
│   │   │   └── admin/       ← AdminDashboard, AdminDepartments, AdminOfficers, AdminReports
│   │   └── styles/          ← Global government-portal CSS design system
│   └── package.json
└── backend/
    ├── .htaccess
    └── api/
        ├── config/db.php    ← DB config, PDO helper, CORS, auth middleware
        ├── auth/            ← register, login, logout, me
        ├── complaints/      ← create, list, detail, update_status
        ├── departments/     ← list, create, update, delete, detail
        ├── officers/        ← list, create, update, delete
        └── reports/         ← summary, by_department, monthly
```

---

## API Reference

All endpoints return JSON:
```json
{ "status": "success", "data": { ... } }
{ "status": "error",   "message": "..." }
```

Protected endpoints require: `Authorization: Bearer <token>`

See `PLANNING.md` Section 0.4 for the full API reference.
