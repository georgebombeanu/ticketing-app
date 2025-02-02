using System.Reflection;
using Microsoft.EntityFrameworkCore;
using TicketingApp.DataAccess;
using TicketingApp.DataAccess.Context;
using TicketingApp.Services.Common.Mapping;
using TicketingApp.Services.Common.Security;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
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

// Register AutoMapper
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(Assembly.GetAssembly(typeof(DepartmentMappingProfile)));
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
