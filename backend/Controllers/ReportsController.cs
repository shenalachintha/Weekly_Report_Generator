using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeeklyReportApi.DTOs;
using WeeklyReportApi.Services;

namespace WeeklyReportApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        private (int userId, string role) GetCurrentUserInfo()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirstValue(ClaimTypes.Role) ?? "TeamMember";
            int.TryParse(idClaim, out int userId);
            return (userId, roleClaim);
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedList<WeeklyReportSummaryDto>>> GetReports(
            [FromQuery] int? userId,
            [FromQuery] int? projectId,
            [FromQuery] string? status,
            [FromQuery] DateTime? weekStartDate,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (currentUserId, currentRole) = GetCurrentUserInfo();
            var reports = await _reportService.GetReportsAsync(currentUserId, currentRole, userId, projectId, status, weekStartDate, page, pageSize);
            return Ok(reports);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WeeklyReportDetailDto>> GetReportById(int id)
        {
            var (currentUserId, currentRole) = GetCurrentUserInfo();
            try
            {
                var report = await _reportService.GetReportByIdAsync(id, currentUserId, currentRole);
                if (report == null)
                {
                    return NotFound(new { message = "Report not found." });
                }
                return Ok(report);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult<WeeklyReportDetailDto>> CreateDraft([FromBody] SaveReportRequest request)
        {
            var (currentUserId, _) = GetCurrentUserInfo();
            try
            {
                var report = await _reportService.CreateOrUpdateDraftAsync(null, request, currentUserId);
                return CreatedAtAction(nameof(GetReportById), new { id = report.Id }, report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<WeeklyReportDetailDto>> UpdateReport(int id, [FromBody] SaveReportRequest request)
        {
            var (currentUserId, _) = GetCurrentUserInfo();
            try
            {
                var report = await _reportService.CreateOrUpdateDraftAsync(id, request, currentUserId);
                return Ok(report);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/submit")]
        public async Task<ActionResult<WeeklyReportDetailDto>> SubmitReport(int id)
        {
            var (currentUserId, _) = GetCurrentUserInfo();
            try
            {
                var report = await _reportService.SubmitReportAsync(id, currentUserId);
                return Ok(report);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Manager")]
        [HttpPost("{id}/review")]
        public async Task<ActionResult<WeeklyReportDetailDto>> ReviewReport(int id, [FromBody] ReviewReportRequest request)
        {
            var (currentUserId, _) = GetCurrentUserInfo();
            try
            {
                var report = await _reportService.ReviewReportAsync(id, request, currentUserId);
                return Ok(report);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/versions")]
        public async Task<ActionResult<List<ReportVersionSummaryDto>>> GetReportVersions(int id)
        {
            var (currentUserId, currentRole) = GetCurrentUserInfo();
            try
            {
                var versions = await _reportService.GetReportVersionsAsync(id, currentUserId, currentRole);
                return Ok(versions);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }
    }
}
