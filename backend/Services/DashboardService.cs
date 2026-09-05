using Microsoft.EntityFrameworkCore;
using WeeklyReportApi.Data;
using WeeklyReportApi.DTOs;
using WeeklyReportApi.Models;

namespace WeeklyReportApi.Services
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetSummaryAsync(DateTime? weekStartDate);
        Task<DashboardChartsDto> GetChartsAsync();
        Task<SideBySideResponseDto> GetSideBySideAsync(DateTime? weekStartDate, string sectionType);
    }

    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync(DateTime? weekStartDate)
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

            var teamMembersCount = await _context.Users.CountAsync(u => u.Role == "TeamMember");

            // Fetch all reports to evaluate dates in memory (avoids EF Core date translation 500 errors)
            var allReports = await _context.WeeklyReports
                .Include(r => r.User)
                .Include(r => r.Project)
                .ToListAsync();

            var currentWeekReports = allReports
                .Where(r => r.WeekStartDate.Date == targetWeekStart.Date)
                .ToList();

            var submittedCount = currentWeekReports.Count(r => r.Status == "Submitted" || r.Status == "Approved");
            var needsCorrectionCount = currentWeekReports.Count(r => r.Status == "NeedsCorrection");
            var approvedCount = currentWeekReports.Count(r => r.Status == "Approved");
            var draftCount = currentWeekReports.Count(r => r.Status == "Draft");

            decimal compliance = teamMembersCount > 0
                ? Math.Round((decimal)submittedCount / teamMembersCount * 100, 1)
                : 0;

            var openBlockersCount = currentWeekReports.Count(r => !string.IsNullOrWhiteSpace(r.BlockersNotes));

            // Fetch comments and project details cleanly
            var rawComments = await _context.ReportComments
                .Include(c => c.Author)
                .Include(c => c.Report)
                    .ThenInclude(r => r!.Project)
                .OrderByDescending(c => c.CreatedAt)
                .Take(5)
                .ToListAsync();

            var recentComments = rawComments.Select(c => new RecentActivityItemDto
            {
                ReportId = c.ReportId,
                UserName = c.Author != null ? c.Author.FullName : "Manager",
                UserAvatarUrl = c.Author != null ? c.Author.AvatarUrl : null,
                ProjectName = c.Report != null && c.Report.Project != null ? c.Report.Project.Name : "Project",
                ActionType = c.Action,
                Message = c.Action == "Approved" 
                    ? "Approved weekly report" 
                    : $"Requested corrections: \"{((c.CommentText ?? "").Length > 60 ? c.CommentText!.Substring(0, 60) + "..." : c.CommentText)}\"",
                Timestamp = c.CreatedAt
            }).ToList();

            var rawSubmissions = allReports
                .Where(r => r.SubmittedAt != null)
                .OrderByDescending(r => r.SubmittedAt)
                .Take(5)
                .ToList();

            var recentSubmissions = rawSubmissions.Select(r => new RecentActivityItemDto
            {
                ReportId = r.Id,
                UserName = r.User != null ? r.User.FullName : "Team Member",
                UserAvatarUrl = r.User != null ? r.User.AvatarUrl : null,
                ProjectName = r.Project != null ? r.Project.Name : "Project",
                ActionType = "Submitted",
                Message = $"Submitted weekly report for week of {r.WeekStartDate:MMM dd} (v{r.CurrentVersionNumber})",
                Timestamp = r.SubmittedAt!.Value
            }).ToList();

            var combinedActivity = recentComments
                .Concat(recentSubmissions)
                .OrderByDescending(a => a.Timestamp)
                .Take(7)
                .ToList();

            return new DashboardSummaryDto
            {
                TotalSubmittedThisWeek = submittedCount,
                TotalTeamMembers = teamMembersCount,
                ComplianceRatePercentage = compliance,
                NeedsCorrectionCount = needsCorrectionCount,
                ApprovedCount = approvedCount,
                DraftCount = draftCount,
                TotalOpenBlockersCount = openBlockersCount,
                RecentActivity = combinedActivity
            };
        }

        public async Task<DashboardChartsDto> GetChartsAsync()
        {
            // 1. Fetch reports into memory for grouping and chart trend calculations
            var allReports = await _context.WeeklyReports
                .Include(r => r.Tasks)
                .Include(r => r.HoursBreakdown)
                .Include(r => r.Project)
                .ToListAsync();

            var weeklyGroups = allReports
                .GroupBy(r => r.WeekStartDate.Date)
                .OrderBy(g => g.Key)
                .Take(8)
                .ToList();

            var trend = weeklyGroups.Select(g => new TaskTrendPointDto
            {
                WeekStartDate = g.Key,
                WeekLabel = g.Key.ToString("MMM dd"),
                TasksCompleted = g.SelectMany(r => r.Tasks).Count(t => t.Status == "Completed"),
                TasksInProgress = g.SelectMany(r => r.Tasks).Count(t => t.Status == "InProgress"),
                TotalHoursSpent = g.SelectMany(r => r.HoursBreakdown).Sum(h => h.HoursSpent)
            }).ToList();

            // 2. Status distribution
            var statusCounts = allReports
                .GroupBy(r => r.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToList();

            var colors = new Dictionary<string, string>
            {
                { "Approved", "#10B981" },
                { "Submitted", "#3B82F6" },
                { "NeedsCorrection", "#F59E0B" },
                { "Draft", "#6B7280" }
            };

            var statusDistribution = statusCounts.Select(s => new StatusDistributionDto
            {
                Status = s.Status,
                Count = s.Count,
                Color = colors.TryGetValue(s.Status, out var c) ? c : "#9CA3AF"
            }).ToList();

            // 3. Workload by project
            var allProjects = await _context.Projects
                .Include(p => p.WeeklyReports)
                    .ThenInclude(r => r.Tasks)
                .Include(p => p.WeeklyReports)
                    .ThenInclude(r => r.HoursBreakdown)
                .ToListAsync();

            var projectDistribution = allProjects.Select(p => new ProjectDistributionDto
            {
                ProjectName = p.Name,
                TaskCount = p.WeeklyReports.SelectMany(r => r.Tasks).Count(),
                HoursSpent = p.WeeklyReports.SelectMany(r => r.HoursBreakdown).Sum(h => h.HoursSpent)
            }).ToList();

            // 4. Hours by task type team-wide
            var allHours = await _context.ReportHoursBreakdowns.ToListAsync();
            var hoursGroup = allHours
                .GroupBy(h => h.TaskType)
                .Select(g => new { TaskType = g.Key, Total = g.Sum(h => h.HoursSpent) })
                .ToList();

            var grandTotalHours = hoursGroup.Sum(h => h.Total);
            var hoursByType = hoursGroup.Select(h => new HoursByTypeDto
            {
                TaskType = h.TaskType,
                Hours = h.Total,
                Percentage = grandTotalHours > 0 ? Math.Round(h.Total / grandTotalHours * 100, 1) : 0
            }).OrderByDescending(h => h.Hours).ToList();

            return new DashboardChartsDto
            {
                TasksTrend = trend,
                StatusDistribution = statusDistribution,
                ProjectDistribution = projectDistribution,
                HoursByType = hoursByType
            };
        }

        public async Task<SideBySideResponseDto> GetSideBySideAsync(DateTime? weekStartDate, string sectionType)
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

            var teamMembers = await _context.Users
                .Where(u => u.Role == "TeamMember")
                .Include(u => u.WeeklyReports)
                    .ThenInclude(r => r.Project)
                .Include(u => u.WeeklyReports)
                    .ThenInclude(r => r.Tasks)
                .Include(u => u.WeeklyReports)
                    .ThenInclude(r => r.HoursBreakdown)
                .ToListAsync();

            var memberItems = new List<SideBySideMemberItemDto>();

            foreach (var member in teamMembers)
            {
                // Filter weekly reports in memory for the exact date
                var report = member.WeeklyReports.FirstOrDefault(r => r.WeekStartDate.Date == targetWeekStart.Date);
                string? content = null;
                int keyIndex = -1;

                if (report != null)
                {
                    if (sectionType.Equals("Achievements", StringComparison.OrdinalIgnoreCase))
                    {
                        content = report.AchievementsNotes;
                        keyIndex = report.KeyAchievementIndex;
                    }
                    else
                    {
                        content = report.BlockersNotes;
                        keyIndex = report.KeyBlockerIndex;
                    }
                }

                memberItems.Add(new SideBySideMemberItemDto
                {
                    UserId = member.Id,
                    UserName = member.FullName,
                    UserAvatarUrl = member.AvatarUrl,
                    JobTitle = member.JobTitle,
                    ReportId = report?.Id,
                    Status = report != null ? report.Status : "NotStarted",
                    ProjectName = report?.Project?.Name,
                    Content = content,
                    KeyIndex = keyIndex,
                    TasksCompletedCount = report?.Tasks.Count(t => t.Status == "Completed") ?? 0,
                    TotalHours = report?.HoursBreakdown.Sum(h => h.HoursSpent) ?? 0
                });
            }

            return new SideBySideResponseDto
            {
                SectionType = sectionType,
                WeekStartDate = targetWeekStart,
                Members = memberItems
            };
        }
    }
}
