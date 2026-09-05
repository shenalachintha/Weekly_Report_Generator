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
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProjectDto>>> GetProjects()
        {
            var projects = await _context.Projects
                .Include(p => p.UserProjects)
                    .ThenInclude(up => up.User)
                .Include(p => p.WeeklyReports)
                .OrderBy(p => p.Name)
                .Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    CategoryTag = p.CategoryTag,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    AssignedMembersCount = p.UserProjects.Count,
                    ReportsCount = p.WeeklyReports.Count,
                    AssignedMembers = p.UserProjects.Select(up => new UserSimpleDto
                    {
                        Id = up.User.Id,
                        FullName = up.User.FullName,
                        Email = up.User.Email,
                        AvatarUrl = up.User.AvatarUrl,
                        Role = up.User.Role
                    }).ToList()
                })
                .ToListAsync();

            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetProjectById(int id)
        {
            var p = await _context.Projects
                .Include(p => p.UserProjects)
                    .ThenInclude(up => up.User)
                .Include(p => p.WeeklyReports)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (p == null)
            {
                return NotFound();
            }

            return Ok(new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                CategoryTag = p.CategoryTag,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                AssignedMembersCount = p.UserProjects.Count,
                ReportsCount = p.WeeklyReports.Count,
                AssignedMembers = p.UserProjects.Select(up => new UserSimpleDto
                {
                    Id = up.User.Id,
                    FullName = up.User.FullName,
                    Email = up.User.Email,
                    AvatarUrl = up.User.AvatarUrl,
                    Role = up.User.Role
                }).ToList()
            });
        }

        [Authorize(Roles = "Manager")]
        [HttpPost]
        public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] SaveProjectRequest request)
        {
            var project = new Project
            {
                Name = request.Name.Trim(),
                Description = request.Description,
                CategoryTag = request.CategoryTag.Trim(),
                Status = request.Status,
                CreatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            if (request.AssignedUserIds != null && request.AssignedUserIds.Any())
            {
                foreach (var uid in request.AssignedUserIds.Distinct())
                {
                    _context.UserProjects.Add(new UserProject { UserId = uid, ProjectId = project.Id });
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetProjectById), new { id = project.Id }, new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                CategoryTag = project.CategoryTag,
                Status = project.Status,
                CreatedAt = project.CreatedAt,
                AssignedMembersCount = request.AssignedUserIds?.Count ?? 0
            });
        }

        [Authorize(Roles = "Manager")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ProjectDto>> UpdateProject(int id, [FromBody] SaveProjectRequest request)
        {
            var project = await _context.Projects
                .Include(p => p.UserProjects)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            project.Name = request.Name.Trim();
            project.Description = request.Description;
            project.CategoryTag = request.CategoryTag.Trim();
            project.Status = request.Status;

            if (request.AssignedUserIds != null)
            {
                _context.UserProjects.RemoveRange(project.UserProjects);
                foreach (var uid in request.AssignedUserIds.Distinct())
                {
                    _context.UserProjects.Add(new UserProject { UserId = uid, ProjectId = project.Id });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(await GetProjectById(id));
        }

        [Authorize(Roles = "Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.WeeklyReports)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            if (project.WeeklyReports.Any())
            {
                // Soft archive to protect integrity of historical weekly reports
                project.Status = "Archived";
                await _context.SaveChangesAsync();
                return Ok(new { message = "Project has linked weekly reports. It has been archived instead of deleted to protect historical records." });
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
