using System.ComponentModel.DataAnnotations;

namespace WeeklyReportApi.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string CategoryTag { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; }
        public int AssignedMembersCount { get; set; }
        public int ReportsCount { get; set; }
        public List<UserSimpleDto> AssignedMembers { get; set; } = new();
    }

    public class UserSimpleDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string Role { get; set; } = string.Empty;
    }

    public class SaveProjectRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [StringLength(50)]
        public string CategoryTag { get; set; } = "Engineering";

        public string Status { get; set; } = "Active";

        public List<int>? AssignedUserIds { get; set; }
    }
}
