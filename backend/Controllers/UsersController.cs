using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeeklyReportApi.Data;
using WeeklyReportApi.DTOs;
using WeeklyReportApi.Models;

namespace WeeklyReportApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.UserProjects)
                    .ThenInclude(up => up.Project)
                .Include(u => u.WeeklyReports)
                .OrderBy(u => u.FullName)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    JobTitle = u.JobTitle,
                    AvatarUrl = u.AvatarUrl,
                    TotalReportsCount = u.WeeklyReports.Count,
                    AssignedProjects = u.UserProjects.Select(up => new ProjectSimpleDto
                    {
                        Id = up.Project.Id,
                        Name = up.Project.Name,
                        CategoryTag = up.Project.CategoryTag
                    }).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}/profile")]
        public async Task<ActionResult<object>> GetUserProfile(int id)
        {
            var user = await _context.Users
                .Include(u => u.UserProjects)
                    .ThenInclude(up => up.Project)
                .Include(u => u.WeeklyReports)
                    .ThenInclude(r => r.Tasks)
                .Include(u => u.WeeklyReports)
                    .ThenInclude(r => r.HoursBreakdown)
                .Include(u => u.WeeklyReports)
                    .ThenInclude(r => r.Project)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var reports = user.WeeklyReports
                .OrderByDescending(r => r.WeekStartDate)
                .Select(r => new
                {
                    r.Id,
                    r.ProjectId,
                    ProjectName = r.Project.Name,
                    r.WeekStartDate,
                    r.WeekEndDate,
                    r.Status,
                    TasksCount = r.Tasks.Count,
                    CompletedTasksCount = r.Tasks.Count(t => t.Status == "Completed"),
                    TotalHours = r.HoursBreakdown.Sum(h => h.HoursSpent),
                    r.CurrentVersionNumber,
                    r.SubmittedAt,
                    r.ReviewedAt
                })
                .ToList();

            var totalTasksCompleted = user.WeeklyReports.SelectMany(r => r.Tasks).Count(t => t.Status == "Completed");
            var totalHoursLogged = user.WeeklyReports.SelectMany(r => r.HoursBreakdown).Sum(h => h.HoursSpent);
            var approvedReportsCount = user.WeeklyReports.Count(r => r.Status == "Approved");

            return Ok(new
            {
                User = new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role,
                    JobTitle = user.JobTitle,
                    AvatarUrl = user.AvatarUrl,
                    TotalReportsCount = user.WeeklyReports.Count,
                    AssignedProjects = user.UserProjects.Select(up => new ProjectSimpleDto
                    {
                        Id = up.Project.Id,
                        Name = up.Project.Name,
                        CategoryTag = up.Project.CategoryTag
                    }).ToList()
                },
                Stats = new
                {
                    TotalReports = user.WeeklyReports.Count,
                    ApprovedReports = approvedReportsCount,
                    PendingReports = user.WeeklyReports.Count(r => r.Status == "Submitted"),
                    NeedsCorrectionReports = user.WeeklyReports.Count(r => r.Status == "NeedsCorrection"),
                    TotalTasksCompleted = totalTasksCompleted,
                    TotalHoursLogged = totalHoursLogged,
                    AverageHoursPerReport = user.WeeklyReports.Any() ? Math.Round(totalHoursLogged / user.WeeklyReports.Count, 1) : 0
                },
                ReportsHistory = reports
            });
        }

        [Authorize(Roles = "Manager")]
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            if (request.Role != "TeamMember" && request.Role != "Manager")
            {
                return BadRequest(new { message = "Invalid role. Role must be 'TeamMember' or 'Manager'." });
            }

            user.Role = request.Role;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User role updated to '{user.Role}' successfully." });
        }

        [Authorize(Roles = "Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.WeeklyReports)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            if (user.WeeklyReports.Any())
            {
                return BadRequest(new { message = "Cannot delete a user who has submitted weekly reports. You can change their role or keep their historical records." });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
