namespace WeeklyReportApi.DTOs
{
    public class DashboardSummaryDto
    {
        public int TotalSubmittedThisWeek { get; set; }
        public int TotalTeamMembers { get; set; }
        public decimal ComplianceRatePercentage { get; set; }
        public int NeedsCorrectionCount { get; set; }
        public int ApprovedCount { get; set; }
        public int DraftCount { get; set; }
        public int TotalOpenBlockersCount { get; set; }

        public List<RecentActivityItemDto> RecentActivity { get; set; } = new();
    }

    public class RecentActivityItemDto
    {
        public int ReportId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatarUrl { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty; // "Submitted", "Approved", "NeedsCorrection", "Updated"
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class TaskTrendPointDto
    {
        public string WeekLabel { get; set; } = string.Empty;
        public DateTime WeekStartDate { get; set; }
        public int TasksCompleted { get; set; }
        public int TasksInProgress { get; set; }
        public decimal TotalHoursSpent { get; set; }
    }

    public class StatusDistributionDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class ProjectDistributionDto
    {
        public string ProjectName { get; set; } = string.Empty;
        public int TaskCount { get; set; }
        public decimal HoursSpent { get; set; }
    }

    public class HoursByTypeDto
    {
        public string TaskType { get; set; } = string.Empty;
        public decimal Hours { get; set; }
        public decimal Percentage { get; set; }
    }

    public class DashboardChartsDto
    {
        public List<TaskTrendPointDto> TasksTrend { get; set; } = new();
        public List<StatusDistributionDto> StatusDistribution { get; set; } = new();
        public List<ProjectDistributionDto> ProjectDistribution { get; set; } = new();
        public List<HoursByTypeDto> HoursByType { get; set; } = new();
    }

    public class SideBySideMemberItemDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatarUrl { get; set; }
        public string? JobTitle { get; set; }
        public int? ReportId { get; set; }
        public string Status { get; set; } = "NotStarted"; // NotStarted, Draft, Submitted, NeedsCorrection, Approved
        public string? ProjectName { get; set; }
        public string? Content { get; set; } // Blockers text or Achievements text
        public int KeyIndex { get; set; } = -1;
        public int TasksCompletedCount { get; set; }
        public decimal TotalHours { get; set; }
    }

    public class SideBySideResponseDto
    {
        public string SectionType { get; set; } = "Blockers"; // "Blockers" or "Achievements"
        public DateTime WeekStartDate { get; set; }
        public List<SideBySideMemberItemDto> Members { get; set; } = new();
    }
}
