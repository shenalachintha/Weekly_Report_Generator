using System.Text.Json;
using WeeklyReportApi.Models;

namespace WeeklyReportApi.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // Automatically creates the database and all tables if they do not exist
            context.Database.EnsureCreated();

            // If users already exist, seed data has already been applied
            if (context.Users.Any())
            {
                return;
            }

            // Standard password hash for 'Password123!'
            string defaultHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

            // 1. Seed Users
            var manager = new User
            {
                FullName = "Sarah Jenkins",
                Email = "sarah.jenkins@company.com",
                PasswordHash = defaultHash,
                Role = "Manager",
                JobTitle = "Engineering Director & Team Lead",
                AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            };

            var alice = new User
            {
                FullName = "Alice Chen",
                Email = "alice.chen@company.com",
                PasswordHash = defaultHash,
                Role = "TeamMember",
                JobTitle = "Senior Frontend Engineer",
                AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            };

            var bob = new User
            {
                FullName = "Bob Miller",
                Email = "bob.miller@company.com",
                PasswordHash = defaultHash,
                Role = "TeamMember",
                JobTitle = "Senior Backend Engineer",
                AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            };

            var charlie = new User
            {
                FullName = "Charlie Davis",
                Email = "charlie.davis@company.com",
                PasswordHash = defaultHash,
                Role = "TeamMember",
                JobTitle = "Full Stack Developer",
                AvatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
            };

            var diana = new User
            {
                FullName = "Diana Prince",
                Email = "diana.prince@company.com",
                PasswordHash = defaultHash,
                Role = "TeamMember",
                JobTitle = "QA & Automation Specialist",
                AvatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
            };

            context.Users.AddRange(manager, alice, bob, charlie, diana);
            context.SaveChanges();

            // 2. Seed Projects
            var projEcom = new Project
            {
                Name = "E-Commerce Platform Redesign",
                Description = "Modernizing checkout flow, product catalog caching, and payment gateway integration.",
                CategoryTag = "Client Project",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
            };

            var projMobile = new Project
            {
                Name = "Mobile App v2.0",
                Description = "Next-gen iOS and Android mobile app build with offline report sync and push alerts.",
                CategoryTag = "Product Development",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
            };

            var projCloud = new Project
            {
                Name = "Cloud Infrastructure & CI/CD",
                Description = "Containerizing microservices, setting up Kubernetes clusters and automated GitHub Actions pipelines.",
                CategoryTag = "Internal Tooling",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            };

            var projAi = new Project
            {
                Name = "AI Insights & Intelligence Engine",
                Description = "LLM summarization, anomaly detection on team velocity, and semantic work search.",
                CategoryTag = "R&D",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddMonths(-1)
            };

            context.Projects.AddRange(projEcom, projMobile, projCloud, projAi);
            context.SaveChanges();

            // 3. User Project Assignments
            context.UserProjects.AddRange(
                new UserProject { UserId = alice.Id, ProjectId = projEcom.Id },
                new UserProject { UserId = alice.Id, ProjectId = projMobile.Id },
                new UserProject { UserId = bob.Id, ProjectId = projCloud.Id },
                new UserProject { UserId = bob.Id, ProjectId = projEcom.Id },
                new UserProject { UserId = charlie.Id, ProjectId = projMobile.Id },
                new UserProject { UserId = charlie.Id, ProjectId = projAi.Id },
                new UserProject { UserId = diana.Id, ProjectId = projEcom.Id },
                new UserProject { UserId = diana.Id, ProjectId = projCloud.Id }
            );
            context.SaveChanges();

            // Helper dates
            DateTime now = DateTime.UtcNow.Date;
            int daysSinceMonday = ((int)now.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
            DateTime currentWeekStart = now.AddDays(-daysSinceMonday);
            DateTime currentWeekEnd = currentWeekStart.AddDays(6);

            DateTime lastWeekStart = currentWeekStart.AddDays(-7);
            DateTime lastWeekEnd = lastWeekStart.AddDays(6);

            DateTime twoWeeksAgoStart = currentWeekStart.AddDays(-14);
            DateTime twoWeeksAgoEnd = twoWeeksAgoStart.AddDays(6);

            // 4. Seed Reports for multiple weeks and statuses

            // --- Report 1: Alice Chen - Current Week (SUBMITTED, ready for manager review) ---
            var report1 = new WeeklyReport
            {
                UserId = alice.Id,
                ProjectId = projEcom.Id,
                WeekStartDate = currentWeekStart,
                WeekEndDate = currentWeekEnd,
                Status = "Submitted",
                TasksPlannedNextWeek = "- Implement Apple Pay and Google Pay one-tap checkout\n- Complete cart abandon recovery flow\n- Performance testing on mobile safari",
                BlockersNotes = "Staging Stripe sandbox webhook key had delay in provisioning.\nThird-party shipping API rate limit on mock testing environment.",
                KeyBlockerIndex = 0, // Flagged key issue
                AchievementsNotes = "Completed checkout modal redesign ahead of schedule.\nReduced page initial bundle size by 35% through dynamic code-splitting.",
                KeyAchievementIndex = 1, // Flagged key achievement
                OptionalNotesOrLinks = "Figma link: https://figma.com/file/demo-checkout-v2\nPR: https://github.com/company/ecom/pull/142",
                CurrentVersionNumber = 1,
                CreatedAt = currentWeekStart.AddDays(4),
                UpdatedAt = currentWeekStart.AddDays(4),
                SubmittedAt = currentWeekStart.AddDays(4).AddHours(17)
            };
            context.WeeklyReports.Add(report1);
            context.SaveChanges();

            report1.Tasks = new List<ReportTask>
            {
                new ReportTask
                {
                    ReportId = report1.Id,
                    TaskName = "Refactor Checkout Multi-step UI Component",
                    Priority = "High",
                    PlannedPercentage = 100,
                    ActualPercentage = 100,
                    Status = "Completed",
                    TimePlannedHours = 16,
                    TimeSpentHours = 14.5m,
                    OutputDeliverable = "Fully responsive React checkout step wizard with client validation.",
                    OrderIndex = 1
                },
                new ReportTask
                {
                    ReportId = report1.Id,
                    TaskName = "Stripe Payment Element Integration",
                    Priority = "High",
                    PlannedPercentage = 100,
                    ActualPercentage = 85,
                    Status = "InProgress",
                    TimePlannedHours = 12,
                    TimeSpentHours = 13,
                    OutputDeliverable = "Payment tokenization working in staging environment.",
                    OrderIndex = 2
                },
                new ReportTask
                {
                    ReportId = report1.Id,
                    TaskName = "Accessibility (a11y) audit for checkout inputs",
                    Priority = "Medium",
                    PlannedPercentage = 100,
                    ActualPercentage = 100,
                    Status = "Completed",
                    TimePlannedHours = 6,
                    TimeSpentHours = 5.5m,
                    OutputDeliverable = "WCAG 2.1 AA compliance audit passed with 0 critical issues.",
                    OrderIndex = 3
                },
                new ReportTask
                {
                    ReportId = report1.Id,
                    TaskName = "Cross-browser regression testing on Safari and Edge",
                    Priority = "Low",
                    PlannedPercentage = 100,
                    ActualPercentage = 60,
                    Status = "InProgress",
                    TimePlannedHours = 6,
                    TimeSpentHours = 4,
                    OutputDeliverable = "Documented 2 styling edge cases on iOS Safari 15.",
                    OrderIndex = 4
                }
            };

            report1.HoursBreakdown = new List<ReportHoursBreakdown>
            {
                new ReportHoursBreakdown { ReportId = report1.Id, TaskType = "Development", HoursSpent = 22 },
                new ReportHoursBreakdown { ReportId = report1.Id, TaskType = "Testing", HoursSpent = 7 },
                new ReportHoursBreakdown { ReportId = report1.Id, TaskType = "Meetings", HoursSpent = 4 },
                new ReportHoursBreakdown { ReportId = report1.Id, TaskType = "CodeReview", HoursSpent = 4 }
            };

            // Snapshot for Version 1
            var snap1 = new
            {
                ReportId = report1.Id,
                report1.WeekStartDate,
                report1.WeekEndDate,
                ProjectName = projEcom.Name,
                Tasks = report1.Tasks.Select(t => new { t.TaskName, t.Priority, t.PlannedPercentage, t.ActualPercentage, t.Status, t.TimePlannedHours, t.TimeSpentHours, t.OutputDeliverable }),
                Hours = report1.HoursBreakdown.Select(h => new { h.TaskType, h.HoursSpent }),
                report1.BlockersNotes,
                report1.KeyBlockerIndex,
                report1.AchievementsNotes,
                report1.KeyAchievementIndex,
                report1.TasksPlannedNextWeek
            };
            report1.Versions.Add(new ReportVersion
            {
                ReportId = report1.Id,
                VersionNumber = 1,
                SnapshotJson = JsonSerializer.Serialize(snap1),
                SubmittedAt = currentWeekStart.AddDays(4).AddHours(17),
                SubmittedByUserId = alice.Id
            });
            context.SaveChanges();

            // --- Report 2: Bob Miller - Current Week (NEEDS CORRECTION with comment and Version History) ---
            var report2 = new WeeklyReport
            {
                UserId = bob.Id,
                ProjectId = projCloud.Id,
                WeekStartDate = currentWeekStart,
                WeekEndDate = currentWeekEnd,
                Status = "NeedsCorrection",
                TasksPlannedNextWeek = "- Complete Terraform modules for Redis cluster\n- Set up automated daily database backup verification",
                BlockersNotes = "Cloud provider quota limits for VPC peering in Frankfurt region.\nWaiting on security sign-off for secrets manager rotation.",
                KeyBlockerIndex = 0,
                AchievementsNotes = "Migrated core Kubernetes cluster to v1.28 without downtime.\nZero incident migration during peak traffic window.",
                KeyAchievementIndex = 0,
                OptionalNotesOrLinks = "Grafana dashboard: https://monitoring.internal/infra-v2",
                CurrentVersionNumber = 1,
                CreatedAt = currentWeekStart.AddDays(3),
                UpdatedAt = currentWeekStart.AddDays(4).AddHours(11),
                SubmittedAt = currentWeekStart.AddDays(4).AddHours(9),
                ReviewedAt = currentWeekStart.AddDays(4).AddHours(11)
            };
            context.WeeklyReports.Add(report2);
            context.SaveChanges();

            report2.Tasks = new List<ReportTask>
            {
                new ReportTask
                {
                    ReportId = report2.Id,
                    TaskName = "Kubernetes Cluster Upgrade to 1.28",
                    Priority = "High",
                    PlannedPercentage = 100,
                    ActualPercentage = 100,
                    Status = "Completed",
                    TimePlannedHours = 18,
                    TimeSpentHours = 20,
                    OutputDeliverable = "Successfully patched all node pools and verified pod health.",
                    OrderIndex = 1
                },
                new ReportTask
                {
                    ReportId = report2.Id,
                    TaskName = "Terraform IaC for VPC Peering",
                    Priority = "Medium",
                    PlannedPercentage = 100,
                    ActualPercentage = 50,
                    Status = "Blocked",
                    TimePlannedHours = 10,
                    TimeSpentHours = 6,
                    OutputDeliverable = "Drafted HCL configuration; awaiting regional quota increase.",
                    OrderIndex = 2
                },
                new ReportTask
                {
                    ReportId = report2.Id,
                    TaskName = "Secrets Manager Automatic Rotation Script",
                    Priority = "High",
                    PlannedPercentage = 100,
                    ActualPercentage = 70,
                    Status = "InProgress",
                    TimePlannedHours = 8,
                    TimeSpentHours = 9,
                    OutputDeliverable = "C# Lambda function for rotating DB credentials.",
                    OrderIndex = 3
                }
            };

            report2.HoursBreakdown = new List<ReportHoursBreakdown>
            {
                new ReportHoursBreakdown { ReportId = report2.Id, TaskType = "Development", HoursSpent = 25 },
                new ReportHoursBreakdown { ReportId = report2.Id, TaskType = "Testing", HoursSpent = 5 },
                new ReportHoursBreakdown { ReportId = report2.Id, TaskType = "Meetings", HoursSpent = 3 },
                new ReportHoursBreakdown { ReportId = report2.Id, TaskType = "Documentation", HoursSpent = 2 }
            };

            var snap2 = new
            {
                ReportId = report2.Id,
                report2.WeekStartDate,
                report2.WeekEndDate,
                ProjectName = projCloud.Name,
                Tasks = report2.Tasks.Select(t => new { t.TaskName, t.Priority, t.PlannedPercentage, t.ActualPercentage, t.Status, t.TimePlannedHours, t.TimeSpentHours, t.OutputDeliverable }),
                Hours = report2.HoursBreakdown.Select(h => new { h.TaskType, h.HoursSpent }),
                report2.BlockersNotes,
                report2.KeyBlockerIndex,
                report2.AchievementsNotes,
                report2.KeyAchievementIndex,
                report2.TasksPlannedNextWeek
            };
            report2.Versions.Add(new ReportVersion
            {
                ReportId = report2.Id,
                VersionNumber = 1,
                SnapshotJson = JsonSerializer.Serialize(snap2),
                SubmittedAt = currentWeekStart.AddDays(4).AddHours(9),
                SubmittedByUserId = bob.Id
            });

            // Manager requested change comment
            report2.Comments.Add(new ReportComment
            {
                ReportId = report2.Id,
                AuthorUserId = manager.Id,
                TargetVersionNumber = 1,
                CommentText = "Great progress on the K8s cluster upgrade! However, for Task #2 (VPC Peering), please specify the ticket number for the AWS quota request so DevOps can follow up. Also, please add documentation hours breakdown if you updated runbooks.",
                Action = "ChangesRequested",
                CreatedAt = currentWeekStart.AddDays(4).AddHours(11)
            });
            context.SaveChanges();

            // --- Report 3: Charlie Davis - Current Week (APPROVED) ---
            var report3 = new WeeklyReport
            {
                UserId = charlie.Id,
                ProjectId = projAi.Id,
                WeekStartDate = currentWeekStart,
                WeekEndDate = currentWeekEnd,
                Status = "Approved",
                TasksPlannedNextWeek = "- Integrate vector store indexing for historical sprint retrospectives\n- Implement response streaming in the chat UI widget",
                BlockersNotes = "High token latency when invoking large context prompts on external model endpoint.",
                KeyBlockerIndex = 0,
                AchievementsNotes = "Built functional prototype of AI conversational assistant for managers.\nFine-tuned semantic prompt template for accurate metric summaries.",
                KeyAchievementIndex = 0,
                OptionalNotesOrLinks = "Demo URL: https://ai-lab.internal/preview\nSwagger schema: /swagger/index.html",
                CurrentVersionNumber = 2,
                CreatedAt = currentWeekStart.AddDays(3),
                UpdatedAt = currentWeekStart.AddDays(4).AddHours(16),
                SubmittedAt = currentWeekStart.AddDays(4).AddHours(14),
                ReviewedAt = currentWeekStart.AddDays(4).AddHours(16)
            };
            context.WeeklyReports.Add(report3);
            context.SaveChanges();

            report3.Tasks = new List<ReportTask>
            {
                new ReportTask
                {
                    ReportId = report3.Id,
                    TaskName = "AI Summary Endpoint Implementation",
                    Priority = "High",
                    PlannedPercentage = 100,
                    ActualPercentage = 100,
                    Status = "Completed",
                    TimePlannedHours = 15,
                    TimeSpentHours = 14,
                    OutputDeliverable = "REST endpoint returning aggregated weekly report insights.",
                    OrderIndex = 1
                },
                new ReportTask
                {
                    ReportId = report3.Id,
                    TaskName = "Prompt Engineering & Evaluation Matrix",
                    Priority = "Medium",
                    PlannedPercentage = 100,
                    ActualPercentage = 100,
                    Status = "Completed",
                    TimePlannedHours = 10,
                    TimeSpentHours = 9.5m,
                    OutputDeliverable = "Structured JSON output schema ensuring 0 hallucinated metrics.",
                    OrderIndex = 2
                },
                new ReportTask
                {
                    ReportId = report3.Id,
                    TaskName = "Chat UI Drawer Component with streaming state",
                    Priority = "Medium",
                    PlannedPercentage = 100,
                    ActualPercentage = 100,
                    Status = "Completed",
                    TimePlannedHours = 12,
                    TimeSpentHours = 12,
                    OutputDeliverable = "Responsive sliding drawer in React with markdown formatting.",
                    OrderIndex = 3
                }
            };

            report3.HoursBreakdown = new List<ReportHoursBreakdown>
            {
                new ReportHoursBreakdown { ReportId = report3.Id, TaskType = "Development", HoursSpent = 24 },
                new ReportHoursBreakdown { ReportId = report3.Id, TaskType = "Testing", HoursSpent = 6 },
                new ReportHoursBreakdown { ReportId = report3.Id, TaskType = "Documentation", HoursSpent = 3.5m },
                new ReportHoursBreakdown { ReportId = report3.Id, TaskType = "Meetings", HoursSpent = 2 }
            };

            // Version 1 snapshot (before correction)
            report3.Versions.Add(new ReportVersion
            {
                ReportId = report3.Id,
                VersionNumber = 1,
                SnapshotJson = JsonSerializer.Serialize(new
                {
                    ReportId = report3.Id,
                    report3.WeekStartDate,
                    ProjectName = projAi.Name,
                    Tasks = report3.Tasks.Take(2).Select(t => new { t.TaskName, t.PlannedPercentage, t.ActualPercentage, t.Status, t.TimeSpentHours }),
                    report3.BlockersNotes,
                    report3.AchievementsNotes
                }),
                SubmittedAt = currentWeekStart.AddDays(3).AddHours(18),
                SubmittedByUserId = charlie.Id
            });

            // Version 2 snapshot (after correction & approval)
            var snap3v2 = new
            {
                ReportId = report3.Id,
                report3.WeekStartDate,
                report3.WeekEndDate,
                ProjectName = projAi.Name,
                Tasks = report3.Tasks.Select(t => new { t.TaskName, t.Priority, t.PlannedPercentage, t.ActualPercentage, t.Status, t.TimePlannedHours, t.TimeSpentHours, t.OutputDeliverable }),
                Hours = report3.HoursBreakdown.Select(h => new { h.TaskType, h.HoursSpent }),
                report3.BlockersNotes,
                report3.KeyBlockerIndex,
                report3.AchievementsNotes,
                report3.KeyAchievementIndex,
                report3.TasksPlannedNextWeek
            };
            report3.Versions.Add(new ReportVersion
            {
                ReportId = report3.Id,
                VersionNumber = 2,
                SnapshotJson = JsonSerializer.Serialize(snap3v2),
                SubmittedAt = currentWeekStart.AddDays(4).AddHours(14),
                SubmittedByUserId = charlie.Id
            });

            report3.Comments.Add(new ReportComment
            {
                ReportId = report3.Id,
                AuthorUserId = manager.Id,
                TargetVersionNumber = 1,
                CommentText = "Please include the UI chat drawer component task in the task table before I approve.",
                Action = "ChangesRequested",
                CreatedAt = currentWeekStart.AddDays(4).AddHours(10)
            });

            report3.Comments.Add(new ReportComment
            {
                ReportId = report3.Id,
                AuthorUserId = manager.Id,
                TargetVersionNumber = 2,
                CommentText = "Looks fantastic! Verified the demo in the lab, well done on keeping prompt output structured.",
                Action = "Approved",
                CreatedAt = currentWeekStart.AddDays(4).AddHours(16)
            });
            context.SaveChanges();

            // --- Report 4: Diana Prince - Current Week (DRAFT) ---
            var report4 = new WeeklyReport
            {
                UserId = diana.Id,
                ProjectId = projEcom.Id,
                WeekStartDate = currentWeekStart,
                WeekEndDate = currentWeekEnd,
                Status = "Draft",
                TasksPlannedNextWeek = "- Run stress testing on checkout surge traffic\n- Automate mobile browser test suites",
                BlockersNotes = "Selenium grid node crash on Chrome 124 headless runner.",
                KeyBlockerIndex = 0,
                AchievementsNotes = "Automated 45 checkout test cases in Playwright with 99.2% stability.",
                KeyAchievementIndex = 0,
                OptionalNotesOrLinks = "Test report: https://ci.company/reports/playwright-ecom-129",
                CurrentVersionNumber = 1,
                CreatedAt = currentWeekStart.AddDays(2),
                UpdatedAt = currentWeekStart.AddDays(4)
            };
            context.WeeklyReports.Add(report4);
            context.SaveChanges();

            report4.Tasks = new List<ReportTask>
            {
                new ReportTask
                {
                    ReportId = report4.Id,
                    TaskName = "Automated Checkout Flow Playwright Suite",
                    Priority = "High",
                    PlannedPercentage = 100,
                    ActualPercentage = 90,
                    Status = "InProgress",
                    TimePlannedHours = 18,
                    TimeSpentHours = 16,
                    OutputDeliverable = "45 E2E automated test scripts integrated in GitHub Actions.",
                    OrderIndex = 1
                },
                new ReportTask
                {
                    ReportId = report4.Id,
                    TaskName = "Payment Gateway Mock Test Suite",
                    Priority = "Medium",
                    PlannedPercentage = 100,
                    ActualPercentage = 75,
                    Status = "InProgress",
                    TimePlannedHours = 10,
                    TimeSpentHours = 8,
                    OutputDeliverable = "Mock credit card failure and 3DS challenge test cases.",
                    OrderIndex = 2
                }
            };

            report4.HoursBreakdown = new List<ReportHoursBreakdown>
            {
                new ReportHoursBreakdown { ReportId = report4.Id, TaskType = "Testing", HoursSpent = 22 },
                new ReportHoursBreakdown { ReportId = report4.Id, TaskType = "Development", HoursSpent = 6 },
                new ReportHoursBreakdown { ReportId = report4.Id, TaskType = "Meetings", HoursSpent = 3 }
            };
            context.SaveChanges();

            // --- Reports for Previous Weeks (Historical data for trends and charts) ---
            // Alice - Last Week (Approved)
            var reportAliceLastWeek = new WeeklyReport
            {
                UserId = alice.Id,
                ProjectId = projMobile.Id,
                WeekStartDate = lastWeekStart,
                WeekEndDate = lastWeekEnd,
                Status = "Approved",
                TasksPlannedNextWeek = "- Start checkout UI redesign\n- Sync with backend team on API models",
                BlockersNotes = "Figma token export sync had missing font weights.",
                KeyBlockerIndex = 0,
                AchievementsNotes = "Delivered Mobile navigation drawer and theme switcher with 60fps smoothness.",
                KeyAchievementIndex = 0,
                CurrentVersionNumber = 1,
                CreatedAt = lastWeekStart.AddDays(4),
                UpdatedAt = lastWeekStart.AddDays(4),
                SubmittedAt = lastWeekStart.AddDays(4).AddHours(17),
                ReviewedAt = lastWeekStart.AddDays(4).AddHours(18)
            };
            context.WeeklyReports.Add(reportAliceLastWeek);
            context.SaveChanges();

            reportAliceLastWeek.Tasks = new List<ReportTask>
            {
                new ReportTask { ReportId = reportAliceLastWeek.Id, TaskName = "Mobile Navigation & Drawer UX", Priority = "High", PlannedPercentage = 100, ActualPercentage = 100, Status = "Completed", TimePlannedHours = 16, TimeSpentHours = 15, OutputDeliverable = "Smooth gesture-based drawer navigation.", OrderIndex = 1 },
                new ReportTask { ReportId = reportAliceLastWeek.Id, TaskName = "Dark Mode & Theme Provider", Priority = "Medium", PlannedPercentage = 100, ActualPercentage = 100, Status = "Completed", TimePlannedHours = 12, TimeSpentHours = 11, OutputDeliverable = "CSS variables and theme context hook.", OrderIndex = 2 }
            };
            reportAliceLastWeek.HoursBreakdown = new List<ReportHoursBreakdown>
            {
                new ReportHoursBreakdown { ReportId = reportAliceLastWeek.Id, TaskType = "Development", HoursSpent = 24 },
                new ReportHoursBreakdown { ReportId = reportAliceLastWeek.Id, TaskType = "Design", HoursSpent = 6 },
                new ReportHoursBreakdown { ReportId = reportAliceLastWeek.Id, TaskType = "Meetings", HoursSpent = 4 }
            };
            reportAliceLastWeek.Comments.Add(new ReportComment
            {
                ReportId = reportAliceLastWeek.Id,
                AuthorUserId = manager.Id,
                TargetVersionNumber = 1,
                CommentText = "Approved! Excellent execution on the gesture animations.",
                Action = "Approved",
                CreatedAt = lastWeekStart.AddDays(4).AddHours(18)
            });

            // Bob - Last Week (Approved)
            var reportBobLastWeek = new WeeklyReport
            {
                UserId = bob.Id,
                ProjectId = projCloud.Id,
                WeekStartDate = lastWeekStart,
                WeekEndDate = lastWeekEnd,
                Status = "Approved",
                TasksPlannedNextWeek = "- Prepare K8s 1.28 cluster migration plan\n- Benchmark database read replicas",
                BlockersNotes = "SSL certificate expiration warning on legacy gateway.",
                KeyBlockerIndex = 0,
                AchievementsNotes = "Automated SSL auto-renewal with Let's Encrypt bot on cluster ingress.",
                KeyAchievementIndex = 0,
                CurrentVersionNumber = 1,
                CreatedAt = lastWeekStart.AddDays(4),
                UpdatedAt = lastWeekStart.AddDays(4),
                SubmittedAt = lastWeekStart.AddDays(4).AddHours(16),
                ReviewedAt = lastWeekStart.AddDays(4).AddHours(17)
            };
            context.WeeklyReports.Add(reportBobLastWeek);
            context.SaveChanges();

            reportBobLastWeek.Tasks = new List<ReportTask>
            {
                new ReportTask { ReportId = reportBobLastWeek.Id, TaskName = "Ingress Cert-Manager Setup", Priority = "High", PlannedPercentage = 100, ActualPercentage = 100, Status = "Completed", TimePlannedHours = 14, TimeSpentHours = 13.5m, OutputDeliverable = "Automated ACME DNS-01 challenge ingress controller.", OrderIndex = 1 },
                new ReportTask { ReportId = reportBobLastWeek.Id, TaskName = "Database Read Replica Latency Profiling", Priority = "Medium", PlannedPercentage = 100, ActualPercentage = 100, Status = "Completed", TimePlannedHours = 10, TimeSpentHours = 10, OutputDeliverable = "Query optimization report and index recommendations.", OrderIndex = 2 }
            };
            reportBobLastWeek.HoursBreakdown = new List<ReportHoursBreakdown>
            {
                new ReportHoursBreakdown { ReportId = reportBobLastWeek.Id, TaskType = "Development", HoursSpent = 22 },
                new ReportHoursBreakdown { ReportId = reportBobLastWeek.Id, TaskType = "Testing", HoursSpent = 6 },
                new ReportHoursBreakdown { ReportId = reportBobLastWeek.Id, TaskType = "Meetings", HoursSpent = 3 }
            };
            reportBobLastWeek.Comments.Add(new ReportComment
            {
                ReportId = reportBobLastWeek.Id,
                AuthorUserId = manager.Id,
                TargetVersionNumber = 1,
                CommentText = "Approved. Great preventive work on the SSL certs.",
                Action = "Approved",
                CreatedAt = lastWeekStart.AddDays(4).AddHours(17)
            });

            // Diana - Last Week (Approved)
            var reportDianaLastWeek = new WeeklyReport
            {
                UserId = diana.Id,
                ProjectId = projCloud.Id,
                WeekStartDate = lastWeekStart,
                WeekEndDate = lastWeekEnd,
                Status = "Approved",
                TasksPlannedNextWeek = "- Expand Playwright coverage to checkout flow",
                BlockersNotes = "Flaky network conditions on CI runner 3.",
                KeyBlockerIndex = 0,
                AchievementsNotes = "Configured automatic retry on flaky integration tests in CI.",
                KeyAchievementIndex = 0,
                CurrentVersionNumber = 1,
                CreatedAt = lastWeekStart.AddDays(4),
                UpdatedAt = lastWeekStart.AddDays(4),
                SubmittedAt = lastWeekStart.AddDays(4).AddHours(15),
                ReviewedAt = lastWeekStart.AddDays(4).AddHours(16)
            };
            context.WeeklyReports.Add(reportDianaLastWeek);
            context.SaveChanges();

            reportDianaLastWeek.Tasks = new List<ReportTask>
            {
                new ReportTask { ReportId = reportDianaLastWeek.Id, TaskName = "CI Flaky Test Auto-retry Mechanism", Priority = "Medium", PlannedPercentage = 100, ActualPercentage = 100, Status = "Completed", TimePlannedHours = 12, TimeSpentHours = 11, OutputDeliverable = "GitHub Actions retry action config file.", OrderIndex = 1 }
            };
            reportDianaLastWeek.HoursBreakdown = new List<ReportHoursBreakdown>
            {
                new ReportHoursBreakdown { ReportId = reportDianaLastWeek.Id, TaskType = "Testing", HoursSpent = 20 },
                new ReportHoursBreakdown { ReportId = reportDianaLastWeek.Id, TaskType = "Documentation", HoursSpent = 4 }
            };
            reportDianaLastWeek.Comments.Add(new ReportComment
            {
                ReportId = reportDianaLastWeek.Id,
                AuthorUserId = manager.Id,
                TargetVersionNumber = 1,
                CommentText = "Approved. Flaky test retries saved us lots of manual rebuilds.",
                Action = "Approved",
                CreatedAt = lastWeekStart.AddDays(4).AddHours(16)
            });

            context.SaveChanges();
        }
    }
}
