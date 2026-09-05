using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using WeeklyReportApi.Data;
using WeeklyReportApi.DTOs;
using WeeklyReportApi.Models;

namespace WeeklyReportApi.Services
{
    public interface IReportService
    {
        Task<PaginatedList<WeeklyReportSummaryDto>> GetReportsAsync(int requestingUserId, string requestingUserRole, int? userIdFilter, int? projectIdFilter, string? statusFilter, DateTime? weekStartDateFilter, int page, int pageSize);
        Task<WeeklyReportDetailDto?> GetReportByIdAsync(int id, int requestingUserId, string requestingUserRole);
        Task<WeeklyReportDetailDto> CreateOrUpdateDraftAsync(int? id, SaveReportRequest request, int userId);
        Task<WeeklyReportDetailDto> SubmitReportAsync(int id, int userId);
        Task<WeeklyReportDetailDto> ReviewReportAsync(int id, ReviewReportRequest request, int managerUserId);
        Task<List<ReportVersionSummaryDto>> GetReportVersionsAsync(int id, int requestingUserId, string requestingUserRole);
    }

    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedList<WeeklyReportSummaryDto>> GetReportsAsync(
            int requestingUserId,
            string requestingUserRole,
            int? userIdFilter,
            int? projectIdFilter,
            string? statusFilter,
            DateTime? weekStartDateFilter,
            int page,
            int pageSize)
        {
            var query = _context.WeeklyReports
                .Include(r => r.User)
                .Include(r => r.Project)
                .Include(r => r.Tasks)
                .Include(r => r.HoursBreakdown)
                .Include(r => r.Comments)
                .AsQueryable();

            // RBAC: Team member can only see their own reports
            if (requestingUserRole != "Manager")
            {
                query = query.Where(r => r.UserId == requestingUserId);
            }
            else
            {
                // Manager can filter by user
                if (userIdFilter.HasValue && userIdFilter.Value > 0)
                {
                    query = query.Where(r => r.UserId == userIdFilter.Value);
                }
            }

            if (projectIdFilter.HasValue && projectIdFilter.Value > 0)
            {
                query = query.Where(r => r.ProjectId == projectIdFilter.Value);
            }

            if (!string.IsNullOrWhiteSpace(statusFilter) && statusFilter != "All")
            {
                query = query.Where(r => r.Status == statusFilter);
            }

            if (weekStartDateFilter.HasValue)
            {
                var dateOnly = weekStartDateFilter.Value.Date;
                var nextDay = dateOnly.AddDays(1);
                query = query.Where(r => r.WeekStartDate >= dateOnly && r.WeekStartDate < nextDay);
            }

            var totalCount = await query.CountAsync();

            var reports = await query
                .OrderByDescending(r => r.WeekStartDate)
                .ThenByDescending(r => r.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new WeeklyReportSummaryDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User.FullName,
                    UserAvatarUrl = r.User.AvatarUrl,
                    ProjectId = r.ProjectId,
                    ProjectName = r.Project.Name,
                    ProjectCategoryTag = r.Project.CategoryTag,
                    WeekStartDate = r.WeekStartDate,
                    WeekEndDate = r.WeekEndDate,
                    Status = r.Status,
                    TasksCount = r.Tasks.Count,
                    TotalHoursSpent = r.HoursBreakdown.Sum(h => h.HoursSpent),
                    CurrentVersionNumber = r.CurrentVersionNumber,
                    SubmittedAt = r.SubmittedAt,
                    ReviewedAt = r.ReviewedAt,
                    LatestCommentText = r.Comments.OrderByDescending(c => c.CreatedAt).Select(c => c.CommentText).FirstOrDefault(),
                    LatestCommentAction = r.Comments.OrderByDescending(c => c.CreatedAt).Select(c => c.Action).FirstOrDefault()
                })
                .ToListAsync();

            return new PaginatedList<WeeklyReportSummaryDto>
            {
                Items = reports,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<WeeklyReportDetailDto?> GetReportByIdAsync(int id, int requestingUserId, string requestingUserRole)
        {
            var report = await _context.WeeklyReports
                .Include(r => r.User)
                .Include(r => r.Project)
                .Include(r => r.Tasks.OrderBy(t => t.OrderIndex))
                .Include(r => r.HoursBreakdown)
                .Include(r => r.Comments.OrderByDescending(c => c.CreatedAt))
                    .ThenInclude(c => c.Author)
                .Include(r => r.Versions.OrderByDescending(v => v.VersionNumber))
                .FirstOrDefaultAsync(r => r.Id == id);

            if (report == null)
            {
                return null;
            }

            // RBAC check: Team member can only view their own report
            if (requestingUserRole != "Manager" && report.UserId != requestingUserId)
            {
                throw new UnauthorizedAccessException("You are not authorized to view another member's report.");
            }

            return MapToDetailDto(report);
        }

        public async Task<WeeklyReportDetailDto> CreateOrUpdateDraftAsync(int? id, SaveReportRequest request, int userId)
        {
            WeeklyReport report;

            if (id.HasValue && id.Value > 0)
            {
                report = await _context.WeeklyReports
                    .Include(r => r.Tasks)
                    .Include(r => r.HoursBreakdown)
                    .Include(r => r.Comments)
                    .Include(r => r.Versions)
                    .FirstOrDefaultAsync(r => r.Id == id.Value)
                    ?? throw new KeyNotFoundException("Report not found.");

                // RBAC: Only report owner can edit
                if (report.UserId != userId)
                {
                    throw new UnauthorizedAccessException("You can only modify your own reports.");
                }

                // Can only edit if in Draft or NeedsCorrection status
                if (report.Status != "Draft" && report.Status != "NeedsCorrection")
                {
                    throw new InvalidOperationException($"Cannot edit report in '{report.Status}' status. Only Draft or NeedsCorrection reports can be edited.");
                }

                // Update fields
                report.ProjectId = request.ProjectId;
                report.WeekStartDate = request.WeekStartDate.Date;
                report.WeekEndDate = request.WeekEndDate.Date;
                report.TasksPlannedNextWeek = request.TasksPlannedNextWeek;
                report.BlockersNotes = request.BlockersNotes;
                report.KeyBlockerIndex = request.KeyBlockerIndex;
                report.AchievementsNotes = request.AchievementsNotes;
                report.KeyAchievementIndex = request.KeyAchievementIndex;
                report.OptionalNotesOrLinks = request.OptionalNotesOrLinks;
                report.UpdatedAt = DateTime.UtcNow;

                // Remove existing tasks & hours to refresh with updated list
                _context.ReportTasks.RemoveRange(report.Tasks);
                _context.ReportHoursBreakdowns.RemoveRange(report.HoursBreakdown);
            }
            else
            {
                // Create new draft
                report = new WeeklyReport
                {
                    UserId = userId,
                    ProjectId = request.ProjectId,
                    WeekStartDate = request.WeekStartDate.Date,
                    WeekEndDate = request.WeekEndDate.Date,
                    Status = "Draft",
                    TasksPlannedNextWeek = request.TasksPlannedNextWeek,
                    BlockersNotes = request.BlockersNotes,
                    KeyBlockerIndex = request.KeyBlockerIndex,
                    AchievementsNotes = request.AchievementsNotes,
                    KeyAchievementIndex = request.KeyAchievementIndex,
                    OptionalNotesOrLinks = request.OptionalNotesOrLinks,
                    CurrentVersionNumber = 1,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.WeeklyReports.Add(report);
            }

            await _context.SaveChangesAsync();

            // Insert tasks
            int order = 1;
            foreach (var task in request.Tasks)
            {
                _context.ReportTasks.Add(new ReportTask
                {
                    ReportId = report.Id,
                    TaskName = task.TaskName,
                    Priority = task.Priority,
                    PlannedPercentage = task.PlannedPercentage,
                    ActualPercentage = task.ActualPercentage,
                    Status = task.Status,
                    TimePlannedHours = task.TimePlannedHours,
                    TimeSpentHours = task.TimeSpentHours,
                    OutputDeliverable = task.OutputDeliverable,
                    OrderIndex = order++
                });
            }

            // Insert hours breakdown
            foreach (var hr in request.HoursBreakdown)
            {
                _context.ReportHoursBreakdowns.Add(new ReportHoursBreakdown
                {
                    ReportId = report.Id,
                    TaskType = hr.TaskType,
                    HoursSpent = hr.HoursSpent
                });
            }

            await _context.SaveChangesAsync();

            return (await GetReportByIdAsync(report.Id, userId, "TeamMember"))!;
        }

        public async Task<WeeklyReportDetailDto> SubmitReportAsync(int id, int userId)
        {
            var report = await _context.WeeklyReports
                .Include(r => r.Tasks)
                .Include(r => r.HoursBreakdown)
                .Include(r => r.Project)
                .FirstOrDefaultAsync(r => r.Id == id)
                ?? throw new KeyNotFoundException("Report not found.");

            if (report.UserId != userId)
            {
                throw new UnauthorizedAccessException("You can only submit your own reports.");
            }

            if (report.Status != "Draft" && report.Status != "NeedsCorrection")
            {
                throw new InvalidOperationException($"Cannot submit a report that is currently in '{report.Status}' status.");
            }

            // If it was in NeedsCorrection, we increment the version number for resubmission
            if (report.Status == "NeedsCorrection")
            {
                report.CurrentVersionNumber += 1;
            }

            report.Status = "Submitted";
            report.SubmittedAt = DateTime.UtcNow;
            report.UpdatedAt = DateTime.UtcNow;

            // Snapshot the submitted version content
            var snapshot = new
            {
                ReportId = report.Id,
                VersionNumber = report.CurrentVersionNumber,
                report.WeekStartDate,
                report.WeekEndDate,
                ProjectName = report.Project?.Name,
                report.TasksPlannedNextWeek,
                report.BlockersNotes,
                report.KeyBlockerIndex,
                report.AchievementsNotes,
                report.KeyAchievementIndex,
                report.OptionalNotesOrLinks,
                Tasks = report.Tasks.Select(t => new
                {
                    t.TaskName,
                    t.Priority,
                    t.PlannedPercentage,
                    t.ActualPercentage,
                    t.Status,
                    t.TimePlannedHours,
                    t.TimeSpentHours,
                    t.OutputDeliverable
                }),
                Hours = report.HoursBreakdown.Select(h => new
                {
                    h.TaskType,
                    h.HoursSpent
                })
            };

            var versionRecord = new ReportVersion
            {
                ReportId = report.Id,
                VersionNumber = report.CurrentVersionNumber,
                SnapshotJson = JsonSerializer.Serialize(snapshot),
                SubmittedAt = DateTime.UtcNow,
                SubmittedByUserId = userId
            };

            _context.ReportVersions.Add(versionRecord);
            await _context.SaveChangesAsync();

            return (await GetReportByIdAsync(report.Id, userId, "TeamMember"))!;
        }

        public async Task<WeeklyReportDetailDto> ReviewReportAsync(int id, ReviewReportRequest request, int managerUserId)
        {
            var report = await _context.WeeklyReports
                .Include(r => r.Comments)
                .FirstOrDefaultAsync(r => r.Id == id)
                ?? throw new KeyNotFoundException("Report not found.");

            if (report.Status != "Submitted")
            {
                throw new InvalidOperationException($"Only 'Submitted' reports can be reviewed. Current status is '{report.Status}'.");
            }

            if (request.Action == "ChangesRequested")
            {
                if (string.IsNullOrWhiteSpace(request.CommentText))
                {
                    throw new ArgumentException("A comment explaining what needs correction is required when requesting changes.");
                }

                report.Status = "NeedsCorrection";
            }
            else if (request.Action == "Approved")
            {
                report.Status = "Approved";
            }
            else
            {
                throw new ArgumentException("Action must be either 'Approved' or 'ChangesRequested'.");
            }

            report.ReviewedAt = DateTime.UtcNow;
            report.UpdatedAt = DateTime.UtcNow;

            // Add comment audit record
            var comment = new ReportComment
            {
                ReportId = report.Id,
                AuthorUserId = managerUserId,
                TargetVersionNumber = report.CurrentVersionNumber,
                CommentText = request.CommentText ?? (request.Action == "Approved" ? "Report approved." : string.Empty),
                Action = request.Action,
                CreatedAt = DateTime.UtcNow
            };

            _context.ReportComments.Add(comment);
            await _context.SaveChangesAsync();

            return (await GetReportByIdAsync(report.Id, managerUserId, "Manager"))!;
        }

        public async Task<List<ReportVersionSummaryDto>> GetReportVersionsAsync(int id, int requestingUserId, string requestingUserRole)
        {
            var report = await _context.WeeklyReports.FindAsync(id);
            if (report == null)
            {
                throw new KeyNotFoundException("Report not found.");
            }

            if (requestingUserRole != "Manager" && report.UserId != requestingUserId)
            {
                throw new UnauthorizedAccessException("Not authorized to view versions for this report.");
            }

            return await _context.ReportVersions
                .Where(v => v.ReportId == id)
                .OrderByDescending(v => v.VersionNumber)
                .Select(v => new ReportVersionSummaryDto
                {
                    Id = v.Id,
                    VersionNumber = v.VersionNumber,
                    SubmittedAt = v.SubmittedAt,
                    SubmittedByUserId = v.SubmittedByUserId,
                    SnapshotJson = v.SnapshotJson
                })
                .ToListAsync();
        }

        private static WeeklyReportDetailDto MapToDetailDto(WeeklyReport r)
        {
            return new WeeklyReportDetailDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserName = r.User.FullName,
                UserEmail = r.User.Email,
                UserJobTitle = r.User.JobTitle,
                UserAvatarUrl = r.User.AvatarUrl,
                ProjectId = r.ProjectId,
                ProjectName = r.Project?.Name ?? string.Empty,
                ProjectCategoryTag = r.Project?.CategoryTag ?? string.Empty,
                WeekStartDate = r.WeekStartDate,
                WeekEndDate = r.WeekEndDate,
                Status = r.Status,
                TasksPlannedNextWeek = r.TasksPlannedNextWeek,
                BlockersNotes = r.BlockersNotes,
                KeyBlockerIndex = r.KeyBlockerIndex,
                AchievementsNotes = r.AchievementsNotes,
                KeyAchievementIndex = r.KeyAchievementIndex,
                OptionalNotesOrLinks = r.OptionalNotesOrLinks,
                CurrentVersionNumber = r.CurrentVersionNumber,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                SubmittedAt = r.SubmittedAt,
                ReviewedAt = r.ReviewedAt,
                Tasks = r.Tasks.OrderBy(t => t.OrderIndex).Select(t => new TaskItemDto
                {
                    Id = t.Id,
                    TaskName = t.TaskName,
                    Priority = t.Priority,
                    PlannedPercentage = t.PlannedPercentage,
                    ActualPercentage = t.ActualPercentage,
                    Status = t.Status,
                    TimePlannedHours = t.TimePlannedHours,
                    TimeSpentHours = t.TimeSpentHours,
                    OutputDeliverable = t.OutputDeliverable,
                    OrderIndex = t.OrderIndex
                }).ToList(),
                HoursBreakdown = r.HoursBreakdown.Select(h => new HoursBreakdownItemDto
                {
                    Id = h.Id,
                    TaskType = h.TaskType,
                    HoursSpent = h.HoursSpent
                }).ToList(),
                Comments = r.Comments.OrderByDescending(c => c.CreatedAt).Select(c => new ReportCommentDto
                {
                    Id = c.Id,
                    AuthorUserId = c.AuthorUserId,
                    AuthorName = c.Author?.FullName ?? "Manager",
                    AuthorAvatarUrl = c.Author?.AvatarUrl,
                    TargetVersionNumber = c.TargetVersionNumber,
                    CommentText = c.CommentText,
                    Action = c.Action,
                    CreatedAt = c.CreatedAt
                }).ToList(),
                Versions = r.Versions.OrderByDescending(v => v.VersionNumber).Select(v => new ReportVersionSummaryDto
                {
                    Id = v.Id,
                    VersionNumber = v.VersionNumber,
                    SubmittedAt = v.SubmittedAt,
                    SubmittedByUserId = v.SubmittedByUserId,
                    SnapshotJson = v.SnapshotJson
                }).ToList()
            };
        }
    }
}
