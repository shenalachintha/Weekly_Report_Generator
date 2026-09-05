using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeeklyReportApi.DTOs;
using WeeklyReportApi.Services;

namespace WeeklyReportApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AiAssistantController : ControllerBase
    {
        private readonly IAiAssistantService _aiService;

        public AiAssistantController(IAiAssistantService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("query")]
        public async Task<ActionResult<AiQueryResponse>> Query([FromBody] AiQueryRequest request)
        {
            var response = await _aiService.QueryTeamActivityAsync(request);
            return Ok(response);
        }

        [HttpGet("summary")]
        public async Task<ActionResult<AiTeamSummaryResponse>> GetSummary([FromQuery] DateTime? weekStartDate)
        {
            var summary = await _aiService.GenerateTeamSummaryAsync(weekStartDate);
            return Ok(summary);
        }
    }
}
