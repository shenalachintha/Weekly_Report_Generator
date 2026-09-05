using System.Text.Json.Serialization;

namespace WeeklyReportApi.Models
{
    public class ReportVersion
    {
        public int Id { get; set; }
        public int ReportId { get; set; }

        [JsonIgnore]
        public WeeklyReport? Report { get; set; }

        public int VersionNumber { get; set; }
        // JSON snapshot of the report fields, tasks list, and hours breakdown at the moment of submission
        public string SnapshotJson { get; set; } = string.Empty;

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public int SubmittedByUserId { get; set; }
    }
}
