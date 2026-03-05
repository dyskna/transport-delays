using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using server.Data;
using server.Services;
using System.Text;
using Microsoft.OpenApi.Models;
using DotNetEnv;

Env.Load();
var builder = WebApplication.CreateBuilder(args);

// Na Railway (i innych chmurach) aplikacja musi słuchać na porcie z zmiennej PORT
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://*:{port}");

// ===========================
// JWT konfiguracja
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = builder.Configuration["Jwt:Key"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!))
        };
    });

// Swagger konfiguracja
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Railert API",
        Version = "v1",
        Description = "API aplikacji Railert – systemu zgłaszania opóźnień i utrudnień w transporcie publicznym."
    });

    // JWT w Swaggerze
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Podaj token JWT (np. 'Bearer {token}')",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Baza danych + serwisy
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<EmailService>();

builder.Services.AddAuthorization();
builder.Services.AddControllers();

// CORS (dla frontendu React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost3000", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHostedService<JourneyBackgroundService>();

var app = builder.Build();

// Middleware
// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Railert API V1");
    });
}

app.UseCors("AllowLocalhost3000");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


// Seed danych 
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();

    try
    {
        context.Database.Migrate();

        if (typeof(SeedData).GetMethod("Initialize") != null)
            SeedData.Initialize(context);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Błąd podczas inicjalizacji bazy danych: {ex.Message}");
    }
}

app.Run();
