using System.ComponentModel.DataAnnotations;

namespace WeeklyReportApi.DTOs
{
    public class TaskItemDto
    {
        public int Id { get; set; }
        [Required]
        public string TaskName { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium"; // High, Medium, Low
        public int PlannedPercentage { get; set; } = 100;
        public int ActualPercentage { get; set; } = 0;
        public string Status { get; set; } = "InProgress"; // Completed, InProgress, Blocked, Deferred
        public decimal TimePlannedHours { get; set; }
        public decimal TimeSpentHours { get; set; }
        public string? OutputDeliverable { get; set; }
        public int OrderIndex { get; set; }
    }

    public class HoursBreakdownItemDto
    {
        public int Id { get; set; }
        [Required]
        public string TaskType { get; set; } = "Development"; // Development, Testing, Meetings, Documentation, CodeReview, Design
        public decimal HoursSpent { get; set; }
    }

    public class SaveReportRequest
    {
        [Required]
        public int ProjectId { get; set; }

        [Required]
        public DateTime WeekStartDate { get; set; }

        [Required]
        public DateTime WeekEndDate { get; set; }

        public string? TasksPlannedNextWeek { get; set; }
        public string? BlockersNotes { get; set; }
        public int KeyBlockerIndex { get; set; } = -1;

        public string? AchievementsNotes { get; set; }
        public int KeyAchievementIndex { get; set; } = -1;

        public string? OptionalNotesOrLinks { get; set; }

        public List<TaskItemDto> Tasks { get; set; } = new();
        public List<HoursBreakdownItemDto> HoursBreakdown { get; set; } = new();
    }

    public class ReviewReportRequest
    {
        [Required]
        public string Action { get; set; } = "Approved"; // "Approved" or "ChangesRequested"

        public string? CommentText { get; set; }
    }

    public class WeeklyReportDetailDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string? UserJobTitle { get; set; }
        public string? UserAvatarUrl { get; set; }

        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectCategoryTag { get; set; } = string.Empty;

        public DateTime WeekStartDate { get; set; }
        public DateTime WeekEndDate { get; set; }
        public string Status { get; set; } = "Draft";

        public string? TasksPlannedNextWeek { get; set; }
        public string? BlockersNotes { get; set; }
        public int KeyBlockerIndex { get; set; } = -1;
        public string? AchievementsNotes { get; set; }
        public int KeyAchievementIndex { get; set; } = -1;
        public string? OptionalNotesOrLinks { get; set; }

        public int CurrentVersionNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }

        public List<TaskItemDto> Tasks { get; set; } = new();
        public List<HoursBreakdownItemDto> HoursBreakdown { get; set; } = new();
        public List<ReportCommentDto> Comments { get; set; } = new();
        public List<ReportVersionSummaryDto> Versions { get; set; } = new();
    }

    public class WeeklyReportSummaryDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatarUrl { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectCategoryTag { get; set; } = string.Empty;
        public DateTime WeekStartDate { get; set; }
        public DateTime WeekEndDate { get; set; }
        public string Status { get; set; } = "Draft";
        public int TasksCount { get; set; }
        public decimal TotalHoursSpent { get; set; }
        public int CurrentVersionNumber { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? LatestCommentText { get; set; }
        public string? LatestCommentAction { get; set; }
    }

    public class ReportCommentDto
    {
        public int Id { get; set; }
        public int AuthorUserId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string? AuthorAvatarUrl { get; set; }
        public int TargetVersionNumber { get; set; }
        public string CommentText { get; set; } = string.Empty;
        public string Action { get; set; } = "General";
        public DateTime CreatedAt { get; set; }
    }

    public class ReportVersionSummaryDto
    {
        public int Id { get; set; }
        public int VersionNumber { get; set; }
        public DateTime SubmittedAt { get; set; }
        public int SubmittedByUserId { get; set; }
        public string SnapshotJson { get; set; } = string.Empty;
    }

    public class PaginatedList<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 1));
    }
}
