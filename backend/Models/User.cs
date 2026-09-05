using System.Text.Json.Serialization;

namespace WeeklyReportApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "TeamMember"; // "TeamMember" or "Manager"
        public string? JobTitle { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<UserProject> UserProjects { get; set; } = new List<UserProject>();
        public ICollection<WeeklyReport> WeeklyReports { get; set; } = new List<WeeklyReport>();
    }
}
