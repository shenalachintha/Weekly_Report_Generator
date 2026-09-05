using System.ComponentModel.DataAnnotations;

namespace WeeklyReportApi.DTOs
{
    public class RegisterRequest
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        public string Role { get; set; } = "TeamMember"; // "TeamMember" or "Manager"
        public string? JobTitle { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? JobTitle { get; set; }
        public string? AvatarUrl { get; set; }
        public List<ProjectSimpleDto> AssignedProjects { get; set; } = new();
        public int TotalReportsCount { get; set; }
    }

    public class ProjectSimpleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CategoryTag { get; set; } = string.Empty;
    }

    public class UpdateRoleRequest
    {
        [Required]
        public string Role { get; set; } = string.Empty; // "TeamMember" or "Manager"
    }
}
