using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeeklyReportApi.DTOs;
using WeeklyReportApi.Services;

namespace WeeklyReportApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _logger = logger;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetSummary([FromQuery] DateTime? weekStartDate)
        {
            try
            {
                var summary = await _dashboardService.GetSummaryAsync(weekStartDate);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dashboard summary: {Message}", ex.Message);
                return StatusCode(500, new { message = "Error loading dashboard summary: " + ex.Message });
            }
        }

        [HttpGet("charts")]
        public async Task<ActionResult<DashboardChartsDto>> GetCharts()
        {
            try
            {
                var charts = await _dashboardService.GetChartsAsync();
                return Ok(charts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dashboard charts: {Message}", ex.Message);
                return StatusCode(500, new { message = "Error loading dashboard charts: " + ex.Message });
            }
        }

        [HttpGet("side-by-side")]
        public async Task<ActionResult<SideBySideResponseDto>> GetSideBySide(
            [FromQuery] DateTime? weekStartDate,
            [FromQuery] string sectionType = "Blockers")
        {
            try
            {
                var sideBySide = await _dashboardService.GetSideBySideAsync(weekStartDate, sectionType);
                return Ok(sideBySide);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching side-by-side data: {Message}", ex.Message);
                return StatusCode(500, new { message = "Error loading side-by-side data: " + ex.Message });
            }
        }
    }
}
