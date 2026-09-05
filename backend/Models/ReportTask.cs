using System.Text.Json.Serialization;

namespace WeeklyReportApi.Models
{
    public class ReportTask
    {
        public int Id { get; set; }
        public int ReportId { get; set; }

        [JsonIgnore]
        public WeeklyReport? Report { get; set; }

        public string TaskName { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium"; // "High", "Medium", "Low"
        public int PlannedPercentage { get; set; } = 100;
        public int ActualPercentage { get; set; } = 0;
        public string Status { get; set; } = "InProgress"; // "Completed", "InProgress", "Blocked", "Deferred"
        public decimal TimePlannedHours { get; set; }
        public decimal TimeSpentHours { get; set; }
        public string? OutputDeliverable { get; set; }
        public int OrderIndex { get; set; }
    }
}
