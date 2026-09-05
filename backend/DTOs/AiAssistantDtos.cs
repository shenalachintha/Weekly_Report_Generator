using System.ComponentModel.DataAnnotations;

namespace WeeklyReportApi.DTOs
{
    public class AiQueryRequest
    {
        [Required]
        public string Prompt { get; set; } = string.Empty;
        public int? ProjectId { get; set; }
        public DateTime? WeekStartDate { get; set; }
    }

    public class AiQueryResponse
    {
        public string Response { get; set; } = string.Empty;
        public List<string> Highlights { get; set; } = new();
        public List<string> RelevantReports { get; set; } = new();
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public class AiTeamSummaryResponse
    {
        public string ExecutiveSummary { get; set; } = string.Empty;
        public List<string> KeyAchievements { get; set; } = new();
        public List<string> CriticalBlockers { get; set; } = new();
        public List<string> WorkloadImbalances { get; set; } = new();
        public List<string> RecommendedActions { get; set; } = new();
        public DateTime WeekStartDate { get; set; }
    }
}
