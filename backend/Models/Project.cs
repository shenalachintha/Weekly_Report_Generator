namespace WeeklyReportApi.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string CategoryTag { get; set; } = "Engineering"; // e.g. "Client Project", "Internal Tooling", "R&D", "Marketing"
        public string Status { get; set; } = "Active"; // "Active", "Completed", "Archived"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<UserProject> UserProjects { get; set; } = new List<UserProject>();
        public ICollection<WeeklyReport> WeeklyReports { get; set; } = new List<WeeklyReport>();
    }
}
