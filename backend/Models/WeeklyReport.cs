namespace WeeklyReportApi.Models
{
    public class WeeklyReport
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public DateTime WeekStartDate { get; set; }
        public DateTime WeekEndDate { get; set; }

        // Status: "Draft", "Submitted", "NeedsCorrection", "Approved"
        public string Status { get; set; } = "Draft";

        public string? TasksPlannedNextWeek { get; set; }
        public string? BlockersNotes { get; set; }
        public int KeyBlockerIndex { get; set; } = -1; // Index or ID of the key blocker

        public string? AchievementsNotes { get; set; }
        public int KeyAchievementIndex { get; set; } = -1; // Index or ID of the key achievement

        public string? OptionalNotesOrLinks { get; set; }

        public int CurrentVersionNumber { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }

        // Navigation Collections
        public ICollection<ReportTask> Tasks { get; set; } = new List<ReportTask>();
        public ICollection<ReportHoursBreakdown> HoursBreakdown { get; set; } = new List<ReportHoursBreakdown>();
        public ICollection<ReportVersion> Versions { get; set; } = new List<ReportVersion>();
        public ICollection<ReportComment> Comments { get; set; } = new List<ReportComment>();
    }
}
