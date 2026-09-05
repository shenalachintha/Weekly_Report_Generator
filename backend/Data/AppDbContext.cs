using Microsoft.EntityFrameworkCore;
using WeeklyReportApi.Models;

namespace WeeklyReportApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<UserProject> UserProjects => Set<UserProject>();
        public DbSet<WeeklyReport> WeeklyReports => Set<WeeklyReport>();
        public DbSet<ReportTask> ReportTasks => Set<ReportTask>();
        public DbSet<ReportHoursBreakdown> ReportHoursBreakdowns => Set<ReportHoursBreakdown>();
        public DbSet<ReportVersion> ReportVersions => Set<ReportVersion>();
        public DbSet<ReportComment> ReportComments => Set<ReportComment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.FullName).HasMaxLength(100).IsRequired();
                entity.Property(u => u.Email).HasMaxLength(150).IsRequired();
                entity.Property(u => u.Role).HasMaxLength(50).IsRequired();
            });

            // Project
            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Name).HasMaxLength(100).IsRequired();
                entity.Property(p => p.CategoryTag).HasMaxLength(50).IsRequired();
                entity.Property(p => p.Status).HasMaxLength(50).IsRequired();
            });

            // UserProject Join
            modelBuilder.Entity<UserProject>(entity =>
            {
                entity.HasKey(up => new { up.UserId, up.ProjectId });
                entity.HasOne(up => up.User)
                      .WithMany(u => u.UserProjects)
                      .HasForeignKey(up => up.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(up => up.Project)
                      .WithMany(p => p.UserProjects)
                      .HasForeignKey(up => up.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // WeeklyReport
            modelBuilder.Entity<WeeklyReport>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Status).HasMaxLength(50).IsRequired();

                entity.HasOne(r => r.User)
                      .WithMany(u => u.WeeklyReports)
                      .HasForeignKey(r => r.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Project)
                      .WithMany(p => p.WeeklyReports)
                      .HasForeignKey(r => r.ProjectId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(r => new { r.UserId, r.WeekStartDate });
            });

            // ReportTask
            modelBuilder.Entity<ReportTask>(entity =>
            {
                entity.HasKey(t => t.Id);
                entity.Property(t => t.TaskName).HasMaxLength(200).IsRequired();
                entity.Property(t => t.TimePlannedHours).HasColumnType("decimal(5,2)");
                entity.Property(t => t.TimeSpentHours).HasColumnType("decimal(5,2)");

                entity.HasOne(t => t.Report)
                      .WithMany(r => r.Tasks)
                      .HasForeignKey(t => t.ReportId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ReportHoursBreakdown
            modelBuilder.Entity<ReportHoursBreakdown>(entity =>
            {
                entity.HasKey(h => h.Id);
                entity.Property(h => h.TaskType).HasMaxLength(50).IsRequired();
                entity.Property(h => h.HoursSpent).HasColumnType("decimal(5,2)");

                entity.HasOne(h => h.Report)
                      .WithMany(r => r.HoursBreakdown)
                      .HasForeignKey(h => h.ReportId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ReportVersion
            modelBuilder.Entity<ReportVersion>(entity =>
            {
                entity.HasKey(v => v.Id);
                entity.HasOne(v => v.Report)
                      .WithMany(r => r.Versions)
                      .HasForeignKey(v => v.ReportId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ReportComment
            modelBuilder.Entity<ReportComment>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.HasOne(c => c.Report)
                      .WithMany(r => r.Comments)
                      .HasForeignKey(c => c.ReportId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.Author)
                      .WithMany()
                      .HasForeignKey(c => c.AuthorUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
