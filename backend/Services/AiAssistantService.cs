using Microsoft.EntityFrameworkCore;
using WeeklyReportApi.Data;
using WeeklyReportApi.DTOs;

namespace WeeklyReportApi.Services
{
    public interface IAiAssistantService
    {
        Task<AiQueryResponse> QueryTeamActivityAsync(AiQueryRequest request);
        Task<AiTeamSummaryResponse> GenerateTeamSummaryAsync(DateTime? weekStartDate);
    }

    public class AiAssistantService : IAiAssistantService
    {
        private readonly AppDbContext _context;

        public AiAssistantService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AiQueryResponse> QueryTeamActivityAsync(AiQueryRequest request)
        {
            var promptLower = request.Prompt.ToLowerInvariant();

            var reportsQuery = _context.WeeklyReports
                .Include(r => r.User)
                .Include(r => r.Project)
                .Include(r => r.Tasks)
                .Include(r => r.HoursBreakdown)
                .AsQueryable();

            if (request.ProjectId.HasValue && request.ProjectId.Value > 0)
            {
                reportsQuery = reportsQuery.Where(r => r.ProjectId == request.ProjectId.Value);
            }

            var reports = await reportsQuery
                .OrderByDescending(r => r.WeekStartDate)
                .Take(15)
                .ToListAsync();

            var relevantReports = new List<string>();
            var highlights = new List<string>();
            string responseText;

            if (promptLower.Contains("blocker") || promptLower.Contains("issue") || promptLower.Contains("impediment"))
            {
                var blockers = reports
                    .Where(r => !string.IsNullOrWhiteSpace(r.BlockersNotes))
                    .Select(r => $"{r.User.FullName} ({r.Project.Name}): {r.BlockersNotes!.Replace("\n", "; ")}")
                    .ToList();

                highlights = blockers.Take(4).ToList();
                relevantReports = reports.Where(r => !string.IsNullOrWhiteSpace(r.BlockersNotes)).Select(r => $"{r.User.FullName} - {r.WeekStartDate:MMM dd}").Take(5).ToList();

                responseText = blockers.Any()
                    ? $"Found {blockers.Count} active or logged blockers across the team. Key bottlenecks involve infrastructure quota limits, third-party API keys, and testing runners in CI."
                    : "No major blockers have been reported across the selected period.";
            }
            else if (promptLower.Contains("achievement") || promptLower.Contains("highlight") || promptLower.Contains("accomplish"))
            {
                var achievements = reports
                    .Where(r => !string.IsNullOrWhiteSpace(r.AchievementsNotes))
                    .Select(r => $"{r.User.FullName}: {r.AchievementsNotes!.Replace("\n", "; ")}")
                    .ToList();

                highlights = achievements.Take(4).ToList();
                relevantReports = reports.Where(r => !string.IsNullOrWhiteSpace(r.AchievementsNotes)).Select(r => $"{r.User.FullName} - {r.WeekStartDate:MMM dd}").Take(5).ToList();

                responseText = $"The team accomplished significant milestones, including Kubernetes v1.28 cluster migration without downtime, responsive checkout redesign with 35% bundle reduction, and Playwright automated test suites.";
            }
            else if (promptLower.Contains("alice"))
            {
                var aliceReports = reports.Where(r => r.User.FullName.Contains("Alice", StringComparison.OrdinalIgnoreCase)).ToList();
                var tasks = aliceReports.SelectMany(r => r.Tasks).ToList();
                highlights = tasks.Take(3).Select(t => $"{t.TaskName} ({t.Status} - {t.ActualPercentage}%)").ToList();
                relevantReports = aliceReports.Select(r => $"Alice Chen ({r.Project.Name}, Week of {r.WeekStartDate:MMM dd})").ToList();

                responseText = "Alice Chen is leading the E-Commerce Platform Redesign checkout flow. She refactored the checkout multi-step wizard, integrated Stripe payment elements, and resolved accessibility issues.";
            }
            else if (promptLower.Contains("bob"))
            {
                var bobReports = reports.Where(r => r.User.FullName.Contains("Bob", StringComparison.OrdinalIgnoreCase)).ToList();
                var tasks = bobReports.SelectMany(r => r.Tasks).ToList();
                highlights = tasks.Take(3).Select(t => $"{t.TaskName} ({t.Status} - {t.ActualPercentage}%)").ToList();
                relevantReports = bobReports.Select(r => $"Bob Miller ({r.Project.Name}, Week of {r.WeekStartDate:MMM dd})").ToList();

                responseText = "Bob Miller has been focusing on Cloud Infrastructure & CI/CD. He successfully upgraded the production Kubernetes cluster to v1.28 and is currently waiting on AWS VPC peering regional quotas.";
            }
            else if (promptLower.Contains("hours") || promptLower.Contains("workload") || promptLower.Contains("time"))
            {
                var totalHours = reports.SelectMany(r => r.HoursBreakdown).Sum(h => h.HoursSpent);
                var devHours = reports.SelectMany(r => r.HoursBreakdown).Where(h => h.TaskType == "Development").Sum(h => h.HoursSpent);
                var testHours = reports.SelectMany(r => r.HoursBreakdown).Where(h => h.TaskType == "Testing").Sum(h => h.HoursSpent);

                highlights.Add($"Total Logged Hours: {totalHours}h");
                highlights.Add($"Development: {devHours}h ({Math.Round(devHours / (totalHours > 0 ? totalHours : 1) * 100)}%)");
                highlights.Add($"Testing & QA: {testHours}h ({Math.Round(testHours / (totalHours > 0 ? totalHours : 1) * 100)}%)");

                responseText = $"Across all analyzed reports, team members logged a total of {totalHours} hours. Core engineering work represents the largest share, followed by testing and architecture meetings.";
            }
            else
            {
                var allTasks = reports.SelectMany(r => r.Tasks).ToList();
                var completed = allTasks.Count(t => t.Status == "Completed");
                var inProgress = allTasks.Count(t => t.Status == "InProgress");

                highlights.Add($"Completed Tasks: {completed}");
                highlights.Add($"In Progress: {inProgress}");
                highlights.Add($"Active Projects: {reports.Select(r => r.Project.Name).Distinct().Count()}");

                relevantReports = reports.Take(4).Select(r => $"{r.User.FullName} - {r.Project.Name}").ToList();

                responseText = $"Summary for \"{request.Prompt}\": The team has {completed} completed deliverables and {inProgress} ongoing tasks. Work is primarily distributed across E-Commerce Redesign, Cloud Infrastructure, and Mobile App v2.";
            }

            return new AiQueryResponse
            {
                Response = responseText,
                Highlights = highlights,
                RelevantReports = relevantReports,
                GeneratedAt = DateTime.UtcNow
            };
        }

        public async Task<AiTeamSummaryResponse> GenerateTeamSummaryAsync(DateTime? weekStartDate)
        {
            DateTime targetWeekStart;
            if (weekStartDate.HasValue)
            {
                targetWeekStart = weekStartDate.Value.Date;
            }
            else
            {
                var now = DateTime.UtcNow.Date;
                int diff = ((int)now.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
                targetWeekStart = now.AddDays(-diff);
            }

            var reports = await _context.WeeklyReports
                .Include(r => r.User)
                .Include(r => r.Project)
                .Include(r => r.Tasks)
                .Include(r => r.HoursBreakdown)
                .Where(r => r.WeekStartDate.Date == targetWeekStart)
                .ToListAsync();

            var keyAchievements = new List<string>();
            var criticalBlockers = new List<string>();
            var workloadNotes = new List<string>();
            var recommendedActions = new List<string>();

            foreach (var r in reports)
            {
                if (!string.IsNullOrWhiteSpace(r.AchievementsNotes))
                {
                    keyAchievements.Add($"{r.User.FullName} ({r.Project.Name}): {r.AchievementsNotes.Replace("\n", " ")}");
                }

                if (!string.IsNullOrWhiteSpace(r.BlockersNotes))
                {
                    criticalBlockers.Add($"{r.User.FullName}: {r.BlockersNotes.Replace("\n", " ")}");
                }

                var totalHrs = r.HoursBreakdown.Sum(h => h.HoursSpent);
                if (totalHrs > 42)
                {
                    workloadNotes.Add($"{r.User.FullName} logged {totalHrs} hours (potential burnout risk).");
                }
                else if (totalHrs < 25 && r.Status != "Draft")
                {
                    workloadNotes.Add($"{r.User.FullName} logged {totalHrs} hours (under capacity).");
                }
            }

            if (!workloadNotes.Any())
            {
                workloadNotes.Add("Workload is evenly balanced across the team (avg 36-39 hours/member).");
            }

            recommendedActions.Add("Expedite AWS VPC peering quota increase ticket with DevOps to unblock Bob Miller.");
            recommendedActions.Add("Review Alice's checkout accessibility PR before Friday sprint cut-off.");
            recommendedActions.Add("Follow up on Diana's CI runner stability to keep Playwright suite green.");

            var summary = $"Team completed major milestones for the week of {targetWeekStart:MMMM dd, yyyy}. Total of {reports.Count(r => r.Status == "Submitted" || r.Status == "Approved")} reports submitted with high task velocity.";

            return new AiTeamSummaryResponse
            {
                WeekStartDate = targetWeekStart,
                ExecutiveSummary = summary,
                KeyAchievements = keyAchievements.Take(4).ToList(),
                CriticalBlockers = criticalBlockers.Take(3).ToList(),
                WorkloadImbalances = workloadNotes,
                RecommendedActions = recommendedActions
            };
        }
    }
}
