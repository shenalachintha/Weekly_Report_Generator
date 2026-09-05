-- =====================================================================================
-- Weekly Report Generator & Team Dashboard
-- Comprehensive SQL Server Schema & Seed Data Script
-- Target Database: SQL Server 2016+ / SQL Server 2019 / 2022 / LocalDB
-- Ready for execution in SQL Server Management Studio (SSMS)
-- =====================================================================================

USE master;
GO

-- 1. Create Database if it does not exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'WeeklyReportDb')
BEGIN
    CREATE DATABASE [WeeklyReportDb];
    PRINT 'Database [WeeklyReportDb] created successfully.';
END
ELSE
BEGIN
    PRINT 'Database [WeeklyReportDb] already exists.';
END
GO

USE [WeeklyReportDb];
GO

-- 2. Drop existing foreign keys and tables if refreshing schema (Idempotent clean recreate)
IF OBJECT_ID(N'dbo.ReportComments', N'U') IS NOT NULL DROP TABLE dbo.ReportComments;
IF OBJECT_ID(N'dbo.ReportVersions', N'U') IS NOT NULL DROP TABLE dbo.ReportVersions;
IF OBJECT_ID(N'dbo.ReportHoursBreakdowns', N'U') IS NOT NULL DROP TABLE dbo.ReportHoursBreakdowns;
IF OBJECT_ID(N'dbo.ReportTasks', N'U') IS NOT NULL DROP TABLE dbo.ReportTasks;
IF OBJECT_ID(N'dbo.WeeklyReports', N'U') IS NOT NULL DROP TABLE dbo.WeeklyReports;
IF OBJECT_ID(N'dbo.UserProjects', N'U') IS NOT NULL DROP TABLE dbo.UserProjects;
IF OBJECT_ID(N'dbo.Projects', N'U') IS NOT NULL DROP TABLE dbo.Projects;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- 3. Create Users Table
CREATE TABLE dbo.Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'TeamMember', -- 'TeamMember' or 'Manager'
    JobTitle NVARCHAR(100) NULL,
    AvatarUrl NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

CREATE INDEX IX_Users_Role ON dbo.Users(Role);
GO

-- 4. Create Projects Table
CREATE TABLE dbo.Projects (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    CategoryTag NVARCHAR(50) NOT NULL DEFAULT 'Engineering', -- Client Project, Product Development, Internal Tooling, R&D
    Status NVARCHAR(50) NOT NULL DEFAULT 'Active', -- Active, Completed, Archived
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- 5. Create UserProjects Join Table (Many-to-Many)
CREATE TABLE dbo.UserProjects (
    UserId INT NOT NULL,
    ProjectId INT NOT NULL,
    PRIMARY KEY (UserId, ProjectId),
    CONSTRAINT FK_UserProjects_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserProjects_Projects FOREIGN KEY (ProjectId) REFERENCES dbo.Projects(Id) ON DELETE CASCADE
);
GO

-- 6. Create WeeklyReports Table
CREATE TABLE dbo.WeeklyReports (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ProjectId INT NOT NULL,
    WeekStartDate DATE NOT NULL,
    WeekEndDate DATE NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Submitted', 'NeedsCorrection', 'Approved'
    TasksPlannedNextWeek NVARCHAR(MAX) NULL,
    BlockersNotes NVARCHAR(MAX) NULL,
    KeyBlockerIndex INT NOT NULL DEFAULT -1,
    AchievementsNotes NVARCHAR(MAX) NULL,
    KeyAchievementIndex INT NOT NULL DEFAULT -1,
    OptionalNotesOrLinks NVARCHAR(MAX) NULL,
    CurrentVersionNumber INT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    SubmittedAt DATETIME2 NULL,
    ReviewedAt DATETIME2 NULL,
    CONSTRAINT FK_WeeklyReports_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_WeeklyReports_Projects FOREIGN KEY (ProjectId) REFERENCES dbo.Projects(Id)
);
GO

CREATE INDEX IX_WeeklyReports_UserId ON dbo.WeeklyReports(UserId);
CREATE INDEX IX_WeeklyReports_ProjectId ON dbo.WeeklyReports(ProjectId);
CREATE INDEX IX_WeeklyReports_Status ON dbo.WeeklyReports(Status);
CREATE INDEX IX_WeeklyReports_WeekStartDate ON dbo.WeeklyReports(WeekStartDate);
GO

-- 7. Create ReportTasks Table
CREATE TABLE dbo.ReportTasks (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ReportId INT NOT NULL,
    TaskName NVARCHAR(200) NOT NULL,
    Priority NVARCHAR(20) NOT NULL DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
    PlannedPercentage INT NOT NULL DEFAULT 100,
    ActualPercentage INT NOT NULL DEFAULT 0,
    Status NVARCHAR(30) NOT NULL DEFAULT 'InProgress', -- 'Completed', 'InProgress', 'Blocked', 'Deferred'
    TimePlannedHours DECIMAL(5,2) NOT NULL DEFAULT 0,
    TimeSpentHours DECIMAL(5,2) NOT NULL DEFAULT 0,
    OutputDeliverable NVARCHAR(500) NULL,
    OrderIndex INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_ReportTasks_WeeklyReports FOREIGN KEY (ReportId) REFERENCES dbo.WeeklyReports(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_ReportTasks_ReportId ON dbo.ReportTasks(ReportId);
GO

-- 8. Create ReportHoursBreakdowns Table
CREATE TABLE dbo.ReportHoursBreakdowns (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ReportId INT NOT NULL,
    TaskType NVARCHAR(50) NOT NULL, -- 'Development', 'Testing', 'Meetings', 'Documentation', 'CodeReview', 'Design'
    HoursSpent DECIMAL(5,2) NOT NULL DEFAULT 0,
    CONSTRAINT FK_ReportHoursBreakdowns_WeeklyReports FOREIGN KEY (ReportId) REFERENCES dbo.WeeklyReports(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_ReportHoursBreakdowns_ReportId ON dbo.ReportHoursBreakdowns(ReportId);
GO

-- 9. Create ReportVersions Table (Section 3 Audit & History)
CREATE TABLE dbo.ReportVersions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ReportId INT NOT NULL,
    VersionNumber INT NOT NULL,
    SnapshotJson NVARCHAR(MAX) NOT NULL,
    SubmittedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    SubmittedByUserId INT NOT NULL,
    CONSTRAINT FK_ReportVersions_WeeklyReports FOREIGN KEY (ReportId) REFERENCES dbo.WeeklyReports(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_ReportVersions_ReportId ON dbo.ReportVersions(ReportId);
GO

-- 10. Create ReportComments Table (Section 3 Manager Review & History)
CREATE TABLE dbo.ReportComments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ReportId INT NOT NULL,
    AuthorUserId INT NOT NULL,
    TargetVersionNumber INT NOT NULL DEFAULT 1,
    CommentText NVARCHAR(MAX) NOT NULL,
    Action NVARCHAR(50) NOT NULL DEFAULT 'General', -- 'ChangesRequested', 'Approved', 'General'
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_ReportComments_WeeklyReports FOREIGN KEY (ReportId) REFERENCES dbo.WeeklyReports(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ReportComments_Users FOREIGN KEY (AuthorUserId) REFERENCES dbo.Users(Id)
);
GO

CREATE INDEX IX_ReportComments_ReportId ON dbo.ReportComments(ReportId);
GO

-- =====================================================================================
-- SEED DATA (3-5 Team Members + 1 Manager, 4 Projects, Several Weeks of Reports)
-- Default password for all users: 'Password123!'
-- BCrypt Hash: '$2a$11$eE6dDk.7rPjO3Wc7r3kL2u1eGZ4p3hM7U1u4mG2nQ0u2kL9h8Z0a.'
-- =====================================================================================

SET IDENTITY_INSERT dbo.Users ON;

INSERT INTO dbo.Users (Id, FullName, Email, PasswordHash, Role, JobTitle, AvatarUrl, CreatedAt)
VALUES 
(1, N'Sarah Jenkins', N'sarah.jenkins@company.com', N'$2a$11$8mOa8uYg8sA.t7fQyY19iOD97xR3e0fR6d1K8V5q3QZ.E9Gq6w0yq', N'Manager', N'Engineering Director & Team Lead', N'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', DATEADD(MONTH, -3, GETUTCDATE())),
(2, N'Alice Chen', N'alice.chen@company.com', N'$2a$11$8mOa8uYg8sA.t7fQyY19iOD97xR3e0fR6d1K8V5q3QZ.E9Gq6w0yq', N'TeamMember', N'Senior Frontend Engineer', N'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', DATEADD(MONTH, -3, GETUTCDATE())),
(3, N'Bob Miller', N'bob.miller@company.com', N'$2a$11$8mOa8uYg8sA.t7fQyY19iOD97xR3e0fR6d1K8V5q3QZ.E9Gq6w0yq', N'TeamMember', N'Senior Backend Engineer', N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', DATEADD(MONTH, -3, GETUTCDATE())),
(4, N'Charlie Davis', N'charlie.davis@company.com', N'$2a$11$8mOa8uYg8sA.t7fQyY19iOD97xR3e0fR6d1K8V5q3QZ.E9Gq6w0yq', N'TeamMember', N'Full Stack Developer', N'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', DATEADD(MONTH, -2, GETUTCDATE())),
(5, N'Diana Prince', N'diana.prince@company.com', N'$2a$11$8mOa8uYg8sA.t7fQyY19iOD97xR3e0fR6d1K8V5q3QZ.E9Gq6w0yq', N'TeamMember', N'QA & Automation Specialist', N'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', DATEADD(MONTH, -2, GETUTCDATE()));

SET IDENTITY_INSERT dbo.Users OFF;
GO

SET IDENTITY_INSERT dbo.Projects ON;

INSERT INTO dbo.Projects (Id, Name, Description, CategoryTag, Status, CreatedAt)
VALUES
(1, N'E-Commerce Platform Redesign', N'Modernizing checkout flow, product catalog caching, and payment gateway integration.', N'Client Project', N'Active', DATEADD(MONTH, -2, GETUTCDATE())),
(2, N'Mobile App v2.0', N'Next-gen iOS and Android mobile app build with offline report sync and push alerts.', N'Product Development', N'Active', DATEADD(MONTH, -2, GETUTCDATE())),
(3, N'Cloud Infrastructure & CI/CD', N'Containerizing microservices, setting up Kubernetes clusters and automated GitHub Actions pipelines.', N'Internal Tooling', N'Active', DATEADD(MONTH, -3, GETUTCDATE())),
(4, N'AI Insights & Intelligence Engine', N'LLM summarization, anomaly detection on team velocity, and semantic work search.', N'R&D', N'Active', DATEADD(MONTH, -1, GETUTCDATE()));

SET IDENTITY_INSERT dbo.Projects OFF;
GO

-- UserProject Mappings
INSERT INTO dbo.UserProjects (UserId, ProjectId)
VALUES 
(2, 1), (2, 2),
(3, 3), (3, 1),
(4, 2), (4, 4),
(5, 1), (5, 3);
GO

-- Weekly Reports & Child Data
DECLARE @currentMonday DATE = DATEADD(DAY, -((DATEPART(WEEKDAY, GETUTCDATE()) + 5) % 7), CAST(GETUTCDATE() AS DATE));
DECLARE @currentSunday DATE = DATEADD(DAY, 6, @currentMonday);

DECLARE @lastMonday DATE = DATEADD(DAY, -7, @currentMonday);
DECLARE @lastSunday DATE = DATEADD(DAY, 6, @lastMonday);

SET IDENTITY_INSERT dbo.WeeklyReports ON;

-- Report 1: Alice Chen (Submitted)
INSERT INTO dbo.WeeklyReports (Id, UserId, ProjectId, WeekStartDate, WeekEndDate, Status, TasksPlannedNextWeek, BlockersNotes, KeyBlockerIndex, AchievementsNotes, KeyAchievementIndex, OptionalNotesOrLinks, CurrentVersionNumber, CreatedAt, UpdatedAt, SubmittedAt, ReviewedAt)
VALUES (1, 2, 1, @currentMonday, @currentSunday, N'Submitted', 
N'- Implement Apple Pay and Google Pay one-tap checkout
- Complete cart abandon recovery flow
- Performance testing on mobile safari',
N'Staging Stripe sandbox webhook key had delay in provisioning.
Third-party shipping API rate limit on mock testing environment.', 0,
N'Completed checkout modal redesign ahead of schedule.
Reduced page initial bundle size by 35% through dynamic code-splitting.', 1,
N'Figma: https://figma.com/file/demo-checkout-v2', 1, GETUTCDATE(), GETUTCDATE(), GETUTCDATE(), NULL);

-- Report 2: Bob Miller (NeedsCorrection)
INSERT INTO dbo.WeeklyReports (Id, UserId, ProjectId, WeekStartDate, WeekEndDate, Status, TasksPlannedNextWeek, BlockersNotes, KeyBlockerIndex, AchievementsNotes, KeyAchievementIndex, OptionalNotesOrLinks, CurrentVersionNumber, CreatedAt, UpdatedAt, SubmittedAt, ReviewedAt)
VALUES (2, 3, 3, @currentMonday, @currentSunday, N'NeedsCorrection', 
N'- Complete Terraform modules for Redis cluster
- Set up automated daily database backup verification',
N'Cloud provider quota limits for VPC peering in Frankfurt region.
Waiting on security sign-off for secrets manager rotation.', 0,
N'Migrated core Kubernetes cluster to v1.28 without downtime.
Zero incident migration during peak traffic window.', 0,
N'Monitoring: https://monitoring.internal/infra-v2', 1, GETUTCDATE(), GETUTCDATE(), DATEADD(HOUR, -5, GETUTCDATE()), DATEADD(HOUR, -2, GETUTCDATE()));

-- Report 3: Charlie Davis (Approved)
INSERT INTO dbo.WeeklyReports (Id, UserId, ProjectId, WeekStartDate, WeekEndDate, Status, TasksPlannedNextWeek, BlockersNotes, KeyBlockerIndex, AchievementsNotes, KeyAchievementIndex, OptionalNotesOrLinks, CurrentVersionNumber, CreatedAt, UpdatedAt, SubmittedAt, ReviewedAt)
VALUES (3, 4, 4, @currentMonday, @currentSunday, N'Approved', 
N'- Integrate vector store indexing for historical sprint retrospectives
- Implement response streaming in the chat UI widget',
N'High token latency when invoking large context prompts on external model endpoint.', 0,
N'Built functional prototype of AI conversational assistant for managers.
Fine-tuned semantic prompt template for accurate metric summaries.', 0,
N'Demo: https://ai-lab.internal/preview', 2, GETUTCDATE(), GETUTCDATE(), DATEADD(HOUR, -8, GETUTCDATE()), DATEADD(HOUR, -4, GETUTCDATE()));

-- Report 4: Diana Prince (Draft)
INSERT INTO dbo.WeeklyReports (Id, UserId, ProjectId, WeekStartDate, WeekEndDate, Status, TasksPlannedNextWeek, BlockersNotes, KeyBlockerIndex, AchievementsNotes, KeyAchievementIndex, OptionalNotesOrLinks, CurrentVersionNumber, CreatedAt, UpdatedAt, SubmittedAt, ReviewedAt)
VALUES (4, 5, 1, @currentMonday, @currentSunday, N'Draft', 
N'- Run stress testing on checkout surge traffic
- Automate mobile browser test suites',
N'Selenium grid node crash on Chrome 124 headless runner.', 0,
N'Automated 45 checkout test cases in Playwright with 99.2% stability.', 0,
N'Test CI: https://ci.company/reports/playwright', 1, GETUTCDATE(), GETUTCDATE(), NULL, NULL);

-- Report 5: Alice Chen (Last Week, Approved)
INSERT INTO dbo.WeeklyReports (Id, UserId, ProjectId, WeekStartDate, WeekEndDate, Status, TasksPlannedNextWeek, BlockersNotes, KeyBlockerIndex, AchievementsNotes, KeyAchievementIndex, OptionalNotesOrLinks, CurrentVersionNumber, CreatedAt, UpdatedAt, SubmittedAt, ReviewedAt)
VALUES (5, 2, 2, @lastMonday, @lastSunday, N'Approved', 
N'- Start checkout UI redesign
- Sync with backend team on API models',
N'Figma token export sync had missing font weights.', 0,
N'Delivered Mobile navigation drawer and theme switcher with 60fps smoothness.', 0,
NULL, 1, DATEADD(DAY, -7, GETUTCDATE()), DATEADD(DAY, -7, GETUTCDATE()), DATEADD(DAY, -7, GETUTCDATE()), DATEADD(DAY, -7, GETUTCDATE()));

SET IDENTITY_INSERT dbo.WeeklyReports OFF;
GO

-- Seed Tasks
INSERT INTO dbo.ReportTasks (ReportId, TaskName, Priority, PlannedPercentage, ActualPercentage, Status, TimePlannedHours, TimeSpentHours, OutputDeliverable, OrderIndex)
VALUES
(1, N'Refactor Checkout Multi-step UI Component', N'High', 100, 100, N'Completed', 16.0, 14.5, N'Fully responsive React checkout step wizard with client validation.', 1),
(1, N'Stripe Payment Element Integration', N'High', 100, 85, N'InProgress', 12.0, 13.0, N'Payment tokenization working in staging environment.', 2),
(1, N'Accessibility (a11y) audit for checkout inputs', N'Medium', 100, 100, N'Completed', 6.0, 5.5, N'WCAG 2.1 AA compliance audit passed with 0 critical issues.', 3),
(2, N'Kubernetes Cluster Upgrade to 1.28', N'High', 100, 100, N'Completed', 18.0, 20.0, N'Successfully patched all node pools and verified pod health.', 1),
(2, N'Terraform IaC for VPC Peering', N'Medium', 100, 50, N'Blocked', 10.0, 6.0, N'Drafted HCL configuration; awaiting regional quota increase.', 2),
(3, N'AI Summary Endpoint Implementation', N'High', 100, 100, N'Completed', 15.0, 14.0, N'REST endpoint returning aggregated weekly report insights.', 1),
(3, N'Prompt Engineering & Evaluation Matrix', N'Medium', 100, 100, N'Completed', 10.0, 9.5, N'Structured JSON output schema ensuring 0 hallucinated metrics.', 2),
(4, N'Automated Checkout Flow Playwright Suite', N'High', 100, 90, N'InProgress', 18.0, 16.0, N'45 E2E automated test scripts integrated in GitHub Actions.', 1),
(5, N'Mobile Navigation & Drawer UX', N'High', 100, 100, N'Completed', 16.0, 15.0, N'Smooth gesture-based drawer navigation.', 1);
GO

-- Seed Hours Breakdown
INSERT INTO dbo.ReportHoursBreakdowns (ReportId, TaskType, HoursSpent)
VALUES
(1, N'Development', 22.0),
(1, N'Testing', 7.0),
(1, N'Meetings', 4.0),
(1, N'CodeReview', 4.0),
(2, N'Development', 25.0),
(2, N'Testing', 5.0),
(2, N'Meetings', 3.0),
(2, N'Documentation', 2.0),
(3, N'Development', 24.0),
(3, N'Testing', 6.0),
(3, N'Documentation', 3.5),
(4, N'Testing', 22.0),
(4, N'Development', 6.0),
(5, N'Development', 24.0),
(5, N'Design', 6.0);
GO

-- Seed Comments (Manager Review Actions)
INSERT INTO dbo.ReportComments (ReportId, AuthorUserId, TargetVersionNumber, CommentText, Action, CreatedAt)
VALUES
(2, 1, 1, N'Great progress on the K8s cluster upgrade! However, for Task #2 (VPC Peering), please specify the ticket number for the AWS quota request so DevOps can follow up.', N'ChangesRequested', DATEADD(HOUR, -2, GETUTCDATE())),
(3, 1, 1, N'Please include the UI chat drawer component task before approval.', N'ChangesRequested', DATEADD(HOUR, -6, GETUTCDATE())),
(3, 1, 2, N'Looks fantastic! Verified the demo in the lab, well done on keeping prompt output structured.', N'Approved', DATEADD(HOUR, -4, GETUTCDATE())),
(5, 1, 1, N'Approved! Excellent execution on the gesture animations.', N'Approved', DATEADD(DAY, -7, GETUTCDATE()));
GO

PRINT N'WeeklyReportDb schema and sample data created successfully!';
GO
