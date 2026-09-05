# Weekly Report Generator & Team Dashboard

A full-stack enterprise web application built for structured weekly work reporting, review and approval workflows with version tracking, and consolidated team performance analytics.

---

## 🛠️ Technology Stack

- **Frontend**: React (JSX) + Vite + Modern Vanilla Design System + Recharts + Lucide Icons
- **Backend**: ASP.NET Core 10 Web API + Entity Framework Core + JWT Authentication + Role-Based Access Control (RBAC)
- **Database**: Microsoft SQL Server (Local instance `localhost` or `(local)`)

---

## 🗄️ Database Setup (දෙවිදියටම Database එක හදාගත හැක)

ඔබට පහත ක්‍රම දෙකෙන් ඕනෑම ක්‍රමයක් භාවිතා කළ හැක:

### ක්‍රමය 1: Backend එක Run කරන විට Automatically Create වීම (Recommended)
Backend එක start වන විට Entity Framework Core මගින් ස්වයංක්‍රීයව `WeeklyReportDb` ඩේටාබේස් එක, සියලුම Tables, Relationships සහ Seed Data (Manager, 4 Team Members, Projects, Weeks of Reports) නිර්මාණය කරයි.

```powershell
cd backend
dotnet run
```
Console එකේ `Database verified and seeded successfully!` පණිවිඩය දැකගත හැක.

---

### ක්‍රමය 2: SQL Server Management Studio (SSMS) එකෙන් Create කිරීම
ප්‍රොජෙක්ට් එකේ root folder එකේ ඇති `Database_Schema_And_Seed.sql` file එක SSMS එකෙන් open කර execute කරන්න:

1. **SQL Server Management Studio (SSMS)** විවෘත කරන්න.
2. ඔබගේ Local Server එකට Connect වන්න (Server Name: `localhost` හෝ `.` හෝ `(local)`).
3. **File > Open > File...** ගොස් `Weekly_Report_Generator\Database_Schema_And_Seed.sql` තෝරන්න (හෝ drag & drop කරන්න).
4. **Execute** බොත්තම ඔබන්න (හෝ **F5** ඔබන්න).
5. SSMS Object Explorer එකේ **Databases** folder එක Refresh (F5) කරන්න. `WeeklyReportDb` සහ සියලුම tables (`Users`, `Projects`, `WeeklyReports`, `ReportTasks`, ආදී) නිර්මාණය වී ඇති බව පෙනෙනු ඇත.

---

## 🚀 How to Run the Application

### 1. Run the Backend (.NET Web API)
```powershell
cd backend
dotnet run --urls "http://localhost:5004"
```
Backend API will be running at: `http://localhost:5004`  
Swagger API Documentation: `http://localhost:5004/swagger`

### 2. Run the Frontend (React Vite App)
නව Terminal window එකක් විවෘත කර:
```powershell
cd frontend
npm install
npm run dev
```
Frontend Web App will be running at: `http://localhost:5173`

---

## 🔑 Pre-seeded Login Credentials (1-Click Demo Available)

Login පිටුවේ ඇති **"1-Click Demo Evaluation"** බොත්තම් මගින් ක්ෂණිකව ඕනෑම role එකකට මාරු විය හැක:

| Role | Name | Email | Password | Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Manager / Admin** | Sarah Jenkins | `sarah.jenkins@company.com` | `Password123!` | Consolidated Dashboard, Review/Approve Reports, Projects & Users CRUD |
| **Senior Frontend** | Alice Chen | `alice.chen@company.com` | `Password123!` | Create & Submit Reports, Checkout flow |
| **Backend Engineer** | Bob Miller | `bob.miller@company.com` | `Password123!` | Kubernetes migration report (Needs Correction demo) |
| **Full Stack Dev** | Charlie Davis | `charlie.davis@company.com` | `Password123!` | Approved report demo with AI chat widget |
| **QA Engineer** | Diana Prince | `diana.prince@company.com` | `Password123!` | Playwright test report (Draft demo) |

---

## ✨ Key Features Implemented

1. **User Authentication & Role-Based Access Control (RBAC)**:
   - Strict API middleware ensuring team members only access their own reports, while managers can review and approve.
2. **Fixed Standardized Weekly Report Template**:
   - Week date range, project tag, task-level table with deliverables and time spent, next week's plan, flagged key blockers & achievements, hours breakdown by task type, and links.
3. **Multi-Cycle Review & Correction Workflow**:
   - `Draft` ➔ `Submitted` ➔ `Needs Correction` ➔ `Approved`.
   - Managers request changes with mandatory comments. Team members see clear feedback banners, edit, and resubmit.
4. **Report Version History**:
   - Every resubmission creates a preserved snapshot (`v1`, `v2`, etc.). Managers and members can toggle between past versions to inspect changes made before approval.
5. **Team Dashboard & Visual Insights**:
   - Recharts graphs: Tasks velocity trend, status breakdown, project workload, hours by task type, and real-time activity feed.
6. **Side-by-Side Team Matrix**:
   - Managers can compare blockers or achievements across all team members for a given sprint side by side.
7. **Interactive AI Chat Assistant**:
   - In-app AI drawer for natural language queries about team velocity, open blockers, and automated executive weekly summaries.
8. **Projects & User Management**:
   - Full CRUD pages with team member assignment and role promotion.
9. **Automated RBAC Test Suite**:
   - 7 automated unit/integration tests (`backend.Tests`) covering access rules and resubmission version increments.

---

## 🧪 Running Automated Tests
```powershell
cd backend.Tests
dotnet test
```
Result: All tests pass with 0 failures.