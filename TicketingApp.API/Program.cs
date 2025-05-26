using System.Reflection;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess;
using TicketingApp.DataAccess.Context;
using TicketingApp.Services.Common.Mapping;
using TicketingApp.Services.Common.Security;
using TicketingApp.Services.Interfaces;
using TicketingApp.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

// Register AutoMapper with all profiles
builder.Services.AddAutoMapper(typeof(UserMappingProfile));
builder.Services.AddAutoMapper(typeof(DepartmentMappingProfile));
builder.Services.AddAutoMapper(typeof(TeamMappingProfile));
builder.Services.AddAutoMapper(typeof(TicketMappingProfile));
builder.Services.AddAutoMapper(typeof(TicketCommentMappingProfile));
builder.Services.AddAutoMapper(typeof(TicketAttachmentMappingProfile));
builder.Services.AddAutoMapper(typeof(TicketCategoryMappingProfile));
builder.Services.AddAutoMapper(typeof(TicketPriorityMappingProfile));
builder.Services.AddAutoMapper(typeof(TicketStatusMappingProfile));

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

// Seed the database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TicketingContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

    // Ensure database is created
    await context.Database.EnsureCreatedAsync();

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