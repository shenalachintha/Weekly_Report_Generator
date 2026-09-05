using System.Text.Json.Serialization;

namespace WeeklyReportApi.Models
{
    public class ReportHoursBreakdown
    {
        public int Id { get; set; }
        public int ReportId { get; set; }

        [JsonIgnore]
        public WeeklyReport? Report { get; set; }

        public string TaskType { get; set; } = "Development"; // Development, Testing, Meetings, Documentation, CodeReview, Design
        public decimal HoursSpent { get; set; }
    }
}
