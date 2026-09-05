using System.Text.Json.Serialization;

namespace WeeklyReportApi.Models
{
    public class ReportComment
    {
        public int Id { get; set; }
        public int ReportId { get; set; }

        [JsonIgnore]
        public WeeklyReport? Report { get; set; }

        public int AuthorUserId { get; set; }
        public User Author { get; set; } = null!;

        public int TargetVersionNumber { get; set; } = 1;
        public string CommentText { get; set; } = string.Empty;
        public string Action { get; set; } = "General"; // ChangesRequested, Approved, General
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
