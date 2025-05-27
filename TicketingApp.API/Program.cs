using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess;
using TicketingApp.DataAccess.Context;
using TicketingApp.Services.Common.Mapping;
using TicketingApp.Services.Common.Security;
using TicketingApp.Services.Interfaces;
using TicketingApp.Services.Implementations;
using TicketingApp.API.Middleware;
using TicketingApp.API.Filters;

var builder = WebApplication.CreateBuilder(args);

// Configure logging first
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Information);

// Add services to the container.
builder.Services.AddControllers(options =>
{
    // Add global logging filter
    options.Filters.Add<LoggingActionFilter>();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register the logging action filter
builder.Services.AddScoped<LoggingActionFilter>();

// Add DbContext
builder.Services.AddDbContext<TicketingContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Register UnitOfWork
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Register Security Services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

// Register Application Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ITicketCategoryService, TicketCategoryService>();
builder.Services.AddScoped<ITicketPriorityService, TicketPriorityService>();
builder.Services.AddScoped<ITicketStatusService, TicketStatusService>();
builder.Services.AddScoped<IFAQService, FAQService>();

// Register AutoMapper with all profiles
builder.Services.AddAutoMapper(cfg =>
{
    // Add all mapping profiles
    cfg.AddProfile<UserMappingProfile>();
    cfg.AddProfile<DepartmentMappingProfile>();
    cfg.AddProfile<TeamMappingProfile>();
    cfg.AddProfile<TicketMappingProfile>();
    cfg.AddProfile<TicketCommentMappingProfile>();
    cfg.AddProfile<TicketAttachmentMappingProfile>();
    cfg.AddProfile<TicketCategoryMappingProfile>();
    cfg.AddProfile<TicketPriorityMappingProfile>();
    cfg.AddProfile<TicketStatusMappingProfile>();
    cfg.AddProfile<FAQMappingProfile>();
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    );
});

var app = builder.Build();

// Use the enhanced exception middleware instead of the basic one
app.UseMiddleware<SimpleGlobalExceptionMiddleware>();

// Seed the database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TicketingContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    var seeder = new TicketingApp.API.Data.DatabaseSeeder(context, passwordHasher);
    await seeder.SeedAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowAll");

// Add JWT Authentication middleware here once we implement it
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();