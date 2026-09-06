# Weekly Report Generator & Team Dashboard

A modern, full-stack enterprise web application built for structured weekly work reporting, multi-cycle review and approval workflows with version tracking, and consolidated team performance analytics.

---

## 🛠️ Technology Stack

- **Frontend**: React (JSX) 19 + Vite + Modern Vanilla CSS Design System + Recharts + Lucide Icons
- **Backend**: ASP.NET Core 10 Web API + Entity Framework Core 10 + JWT Authentication + Role-Based Access Control (RBAC)
- **Database**: Microsoft SQL Server (Local instance: `localhost`, `.`, `.\SQLEXPRESS`, or `(local)`)

---

## 📋 Prerequisites

Before running the application, ensure you have the following software installed on your machine:

1. **.NET 10.0 SDK** (or .NET 10 runtime)  
   Verify installation:
   ```powershell
   dotnet --version
   ```
2. **Node.js (v18.0.0 or higher, v20+ recommended)** and **npm**  
   Verify installation:
   ```powershell
   node -v
   npm -v
   ```
3. **Microsoft SQL Server** (2019 / 2022 / SQL Server Express / Developer Edition) & **SQL Server Management Studio (SSMS)** (optional, but recommended).

---

## 🚀 Setup & Execution Guide

Follow these 4 steps to install dependencies and run the complete system:

```text
Step 1: Installing Dependencies  ──►  Step 2: Running Database  ──►  Step 3: Running Backend  ──►  Step 4: Running Frontend
```

---

### 1) Installing Dependencies

Both backend and frontend dependencies must be installed prior to first launch.

#### A. Backend Dependencies (.NET Web API)
Open a terminal in the project root:
```powershell
cd backend
dotnet restore
```
> **What this installs:**  
> - `Microsoft.EntityFrameworkCore.SqlServer` (EF Core SQL Server Provider)  
> - `Microsoft.AspNetCore.Authentication.JwtBearer` (JWT Token Security)  
> - `BCrypt.Net-Next` (Password hashing)  
> - `Swashbuckle.AspNetCore` (Swagger / OpenAPI UI)  
> - `Microsoft.EntityFrameworkCore.Tools` (Database tools)

#### B. Frontend Dependencies (React + Vite)
Open another terminal in the project root:
```powershell
cd frontend
npm install
```
> **What this installs:**  
> - `react` & `react-dom` (React 19 framework)  
> - `vite` & `@vitejs/plugin-react` (Build tooling & dev server)  
> - `recharts` (Interactive charts & velocity analytics)  
> - `lucide-react` (Modern vector iconography)  
> - `oxlint` (Linter)

---

### 2) Running the Database

The application requires a Microsoft SQL Server instance hosting the `WeeklyReportDb` database.

#### Step 2.1: Verify SQL Server is Running
Ensure the SQL Server service is active on your machine:
- **Windows Services**: Open `services.msc` and ensure **SQL Server (MSSQLSERVER)** or **SQL Server (SQLEXPRESS)** is in **Running** status.
- **PowerShell check**:
  ```powershell
  Get-Service -Name "*MSSQL*"
  ```
  If stopped, start the service:
  ```powershell
  Start-Service -Name "MSSQLSERVER"
  # Or for SQL Express:
  # Start-Service -Name "MSSQL`$SQLEXPRESS"
  ```

#### Step 2.2: Configure the Connection String
Check `backend/appsettings.json`. By default, it connects using Windows Authentication:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=WeeklyReportDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
}
```
- **If using SQL Server Express**, change `Server=localhost;` to `Server=.\\SQLEXPRESS;` or `Server=localhost\\SQLEXPRESS;`.
- **If using SQL Authentication (`sa`)**, update to:
  ```json
  "DefaultConnection": "Server=localhost;Database=WeeklyReportDb;User Id=sa;Password=YourPasswordHere;MultipleActiveResultSets=true;TrustServerCertificate=True;"
  ```

#### Step 2.3: Initialize the Database (Dual Options)

Choose **either** Option A or Option B:

##### Option A: Automatic Initialization on Backend Startup (Recommended)
When you start the backend (Step 3), Entity Framework Core will automatically:
1. Verify if `WeeklyReportDb` exists (if not, create it).
2. Generate all tables, relationships, and foreign keys.
3. Seed default users (Manager & Team Members), sample projects, and multi-week report history.

##### Option B: Manual Execution via SSMS or `sqlcmd`
A complete, standalone SQL script with table schemas and seed data is included in the project root: `Database_Schema_And_Seed.sql`.

- **Using SSMS**:
  1. Open **SQL Server Management Studio (SSMS)**.
  2. Connect to your SQL Server instance (`localhost`, `.`, or `.\SQLEXPRESS`).
  3. Open `Database_Schema_And_Seed.sql` (`File` > `Open` > `File...`).
  4. Press **F5** (or click **Execute**).
  5. Refresh the Object Explorer to view `WeeklyReportDb` with all tables populated.
- **Using `sqlcmd` (Terminal)**:
  ```powershell
  sqlcmd -S localhost -E -i Database_Schema_And_Seed.sql
  ```

---

### 3) Running the Backend (.NET Web API)

1. Open a terminal and navigate to the `backend` folder:
   ```powershell
   cd backend
   ```
2. Start the backend Web API:
   ```powershell
   dotnet run --urls "http://localhost:5004"
   ```
3. **Verify Successful Startup**:
   You should see console output similar to:
   ```text
   info: Program[0]
         Database verified and seeded successfully!
   info: Microsoft.Hosting.Lifetime[14]
         Now listening on: http://localhost:5004
   info: Microsoft.Hosting.Lifetime[0]
         Application started. Press Ctrl+C to shut down.
   ```
4. **Endpoints & Documentation**:
   - **Backend API Base**: `http://localhost:5004/api`
   - **Interactive Swagger Documentation**: `http://localhost:5004/swagger`  
     *(Open in your browser to inspect and test all REST endpoints)*

---

### 4) Running the Frontend (React + Vite)

1. Open a separate terminal window and navigate to the `frontend` folder:
   ```powershell
   cd frontend
   ```
2. Start the Vite development server:
   ```powershell
   npm run dev
   ```
3. **Verify Successful Startup**:
   You should see output similar to:
   ```text
     VITE v8.2.2  ready in 250 ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
     ➜  press h + enter to show help
   ```
4. **Access the Application**:
   - Open your web browser and navigate to: **`http://localhost:5173`**
   - The frontend automatically routes API calls to `http://localhost:5004/api`.

#### Additional Frontend Commands:
- **Build for Production**:
  ```powershell
  npm run build
  ```
  Generates optimized production assets in `frontend/dist/`.
- **Preview Production Build**:
  ```powershell
  npm run preview
  ```
- **Run Linter**:
  ```powershell
  npm run lint
  ```

---

## 🔑 Pre-seeded Login Credentials (1-Click Demo Available)

The login screen features **"1-Click Demo Evaluation"** buttons that allow you to instantly switch between personas without manual typing:

| Role | Name | Email | Password | Scope & Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Manager / Admin** | Sarah Jenkins | `sarah.jenkins@company.com` | `Password123!` | Consolidated Team Dashboard, Review/Approve Reports, Projects & Users CRUD |
| **Senior Frontend** | Alice Chen | `alice.chen@company.com` | `Password123!` | Create & Submit Reports, E-Commerce checkout deliverables |
| **Backend Engineer** | Bob Miller | `bob.miller@company.com` | `Password123!` | Cloud migration deliverables (Needs Correction demonstration) |
| **Full Stack Dev** | Charlie Davis | `charlie.davis@company.com` | `Password123!` | AI research deliverables (Approved demonstration) |
| **QA Engineer** | Diana Prince | `diana.prince@company.com` | `Password123!` | Playwright test automation deliverables (Draft demonstration) |

---

## 🛠️ Common Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`Cannot connect to SQL Server`** | SQL Server service is stopped or server name is incorrect | Verify SQL Server is running in `services.msc`. If using SQL Server Express, update `backend/appsettings.json` with `Server=.\\SQLEXPRESS;`. |
| **`Port 5004 already in use`** | Another process is using port 5004 | Terminate the existing process or launch with another port: `dotnet run --urls "http://localhost:5005"`. (If changed, update `API_BASE` in `frontend/src/api.js`). |
| **`CORS error in browser console`** | Backend is not running or origin blocked | Ensure backend is running at `http://localhost:5004`. CORS is pre-configured in `Program.cs` to allow all origins during development. |
| **`npm install` fails** | Node version incompatibility | Ensure you have Node.js v18+ installed. Try clearing npm cache: `npm cache clean --force` then re-run `npm install`. |

---

## ✨ Key Features & Architecture

### 1. User Authentication & Role-Based Access Control (RBAC)
- Secure JWT Bearer authentication with claims-based authorization policies (`TeamMember` vs `Manager`).
- Team members can only access and edit their own reports; managers have team-wide visibility, analytics, and review privileges.

### 2. Standardized Weekly Report Template
- Fixed, uniform field layout across all team members to guarantee consistency and comparability.
- Includes:
  - Week date range picker (Monday to Sunday)
  - Project / category classification
  - Task-level table: Task Name, Priority (`High`, `Medium`, `Low`), Progress percentage sliders, Status, Planned vs. Spent Hours, and Output / Deliverable produced
  - Tasks planned for next week
  - Blockers & Challenges with **"Flag as Key Issue for the Week"** toggle
  - Achievements & Highlights with **"Flag as Key Achievement for the Week"** toggle
  - Hours worked breakdown by task type (Development, Testing, Meetings, Documentation, Code Review, Design)
  - Optional documentation links and repository PRs

### 3. Review & Correction Workflow (Multi-Cycle)
- Status lifecycle: `Draft` ➔ `Submitted` ➔ `Needs Correction` ➔ `Approved`.
- When a manager requests changes, a prominent **Correction Notice** appears on the team member's report with actionable feedback.
- The team member edits the report and resubmits it, advancing the version number.

### 4. Report Version History & Snapshot Audit
- Every submission and resubmission captures an immutable JSON snapshot.
- Managers and members can switch between historical versions (`v1`, `v2`, etc.) to view changes made between review cycles.
- Maintains a permanent audit trail of manager review comments linked to specific versions.

### 5. Consolidated Team Dashboard (Manager View)
- Summary KPIs: Total Reports Submitted This Week, Submission Compliance Rate %, Reports in Needs Correction, Open Blockers.
- Interactive **Recharts** visualizations:
  - Weekly task completion velocity trend
  - Report status distribution breakdown
  - Workload and hours logged per project
  - Team-wide hours spent by task type
- Real-time team activity feed and filterable reports directory (by member, project, status, and week).

### 6. Side-by-Side Matrix View
- Cross-team comparative matrix allowing managers to view **Blockers** or **Achievements** across all team members for a given sprint side by side.

### 7. Interactive AI Chat Assistant
- Conversational drawer allowing managers to query team activity (e.g., *"Who has open blockers this week?"*, *"What did Alice work on?"*).
- Instant AI-generated executive weekly summaries highlighting accomplishments and recommended manager follow-ups.

### 8. Project & User Management
- Full CRUD interface for managing projects, categories, and assigning team members.
- Organization directory for managing member accounts and promoting roles.

---

## 📁 Repository Structure

```text
Weekly_Report_Generator/
├── Database_Schema_And_Seed.sql   # Standalone SQL Server Management Studio (SSMS) script
├── ER_DIAGRAM.md                  # Entity Relationship Diagram & architectural documentation
├── README.md                      # Setup and operational instructions
├── .gitignore                     # Git ignore rules for .NET, React, and SQL Server
│
├── backend/                       # ASP.NET Core 10 Web API
│   ├── Controllers/               # REST API Controllers (Auth, Reports, Dashboard, Projects, Users, AI)
│   ├── Data/                      # AppDbContext & DbInitializer (automatic seeding)
│   ├── DTOs/                      # Request & Response Data Transfer Objects
│   ├── Models/                    # Relational Entity Models
│   ├── Services/                  # Business logic, token generation, and dashboard aggregation
│   ├── WeeklyReportApi.csproj     # .NET project configuration and NuGet packages
│   └── Program.cs                 # HTTP pipeline, CORS, JWT, and Swagger configuration
│
└── frontend/                      # React (JSX) 19 + Vite Application
    ├── src/
    │   ├── components/            # Reusable UI (Navbar, AiAssistantDrawer)
    │   ├── context/               # AuthContext (state, JWT storage, quick demo switcher)
    │   ├── pages/                 # All 10 views (Dashboard, Reports, Review, Side-by-Side, etc.)
    │   ├── api.js                 # Central HTTP client with JWT interceptors
    │   └── index.css              # Custom responsive dark design system
    ├── index.html                 # HTML shell with Google Fonts
    └── package.json               # Frontend dependencies (Lucide, Recharts)
```