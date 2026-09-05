using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using WeeklyReportApi.Data;
using WeeklyReportApi.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Connection string and DbContext setup
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Database=WeeklyReportDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

// 2. Application Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAiAssistantService, AiAssistantService>();

// 3. Authentication & JWT Bearer
var jwtKey = builder.Configuration["Jwt:Key"] ?? "WeeklyReport_SuperSecretEncryptionSecurityKey_2026_Enterprise!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "WeeklyReportApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "WeeklyReportClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// 4. CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 5. Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// 6. Swagger / OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Weekly Report Generator API",
        Version = "v1",
        Description = "ASP.NET Core Web API with JWT Authentication & Role-Based Access Control"
    });
});

var app = builder.Build();

// 7. Automatic Database Creation & Seeding on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        logger.LogInformation("Checking database and applying auto-creation/seeding...");
        var context = services.GetRequiredService<AppDbContext>();
        DbInitializer.Initialize(context);
        logger.LogInformation("Database verified and seeded successfully!");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database initialization: {Message}", ex.Message);
        // If localhost failed, attempt fallback to localdb
        try
        {
            logger.LogWarning("Attempting fallback connection to LocalDB (MSSQLLocalDB)...");
            var fallbackOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=WeeklyReportDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;")
                .Options;

            using var fallbackContext = new AppDbContext(fallbackOptions);
            DbInitializer.Initialize(fallbackContext);
            logger.LogInformation("Fallback database initialized on LocalDB successfully!");
        }
        catch (Exception fallbackEx)
        {
            logger.LogError(fallbackEx, "Fallback initialization also failed: {Message}", fallbackEx.Message);
        }
    }
}

// 8. HTTP Pipeline
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Weekly Report Generator API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
