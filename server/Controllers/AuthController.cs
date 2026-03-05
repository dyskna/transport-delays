using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Services;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, JwtService jwtService, EmailService emailService, IConfiguration config)
        {
            _context = context;
            _jwtService = jwtService;
            _emailService = emailService;
            _config = config;
        }

        [HttpGet("verify")]
        public async Task<IActionResult> Verify(string token)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.EmailConfirmationToken == token &&
                u.EmailConfirmationTokenExpires > DateTime.UtcNow);

            if (user == null)
                return BadRequest("Nieprawidłowy lub przeterminowany token.");

            user.IsEmailConfirmed = true;
            user.EmailConfirmationToken = null;
            user.EmailConfirmationTokenExpires = null;
            await _context.SaveChangesAsync();

            var frontendUrl = _config["Urls:Frontend"] ?? "http://localhost:3000";
            return Redirect($"{frontendUrl}/logowanie?status=verified");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Użytkownik o tym adresie e-mail już istnieje.");

            var token = Guid.NewGuid().ToString();
            var user = new User
            {
                Email = request.Email,
                PasswordHash = PasswordHelper.HashPassword(request.Password),
                DisplayName = request.DisplayName ?? request.Email.Split('@')[0],
                EmailConfirmationToken = token,
                EmailConfirmationTokenExpires = DateTime.UtcNow.AddMinutes(15),
                Role = UserRole.Passenger,
                ReputationPoints = 0,
                ReportsCount = 0
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var backendUrl = _config["Urls:Backend"] ?? "https://localhost:7265";
            var verificationUrl = $"{backendUrl}/api/auth/verify?token={token}";
            var emailBody = $"Kliknij, aby aktywować konto: <a href='{verificationUrl}'>AKTYWUJ</a>";

            await _emailService.SendEmailAsync(request.Email, "Aktywuj konto Railert", emailBody);

            return Ok(new { message = "Rejestracja zakończona pomyślnie. Sprawdź swoją skrzynkę mailową." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !PasswordHelper.VerifyPassword(request.Password, user.PasswordHash))
                return Unauthorized("Nieprawidłowy e-mail lub hasło.");

            if (!user.IsEmailConfirmed)
                return Unauthorized("Konto nie zostało jeszcze zweryfikowane.");

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                DisplayName = user.DisplayName,
                Role = user.Role.ToString(),
                ReputationPoints = user.ReputationPoints
            });
        }

        [HttpPost("request-password-reset")]
        public async Task<IActionResult> RequestPasswordReset([FromBody] ResetPasswordEmailRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !user.IsEmailConfirmed)
                return Ok();

            var token = Guid.NewGuid().ToString();
            user.PasswordResetToken = token;
            user.PasswordResetTokenExpires = DateTime.UtcNow.AddMinutes(15);
            await _context.SaveChangesAsync();

            var frontendUrl = _config["Urls:Frontend"] ?? "http://localhost:3000";
            var resetUrl = $"{frontendUrl}/resetuj-haslo?token={token}";
            var body = $"Kliknij, aby zresetować hasło: <a href='{resetUrl}'>Resetuj hasło</a>";

            await _emailService.SendEmailAsync(user.Email, "Resetowanie hasła w Railert", body);

            return Ok(new { message = "Jeśli adres e-mail jest poprawny, wysłano link do resetowania hasła." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PasswordResetToken == request.Token && u.PasswordResetTokenExpires > DateTime.UtcNow);

            if (user == null)
                return BadRequest("Nieprawidłowy lub przeterminowany token.");

            user.PasswordHash = PasswordHelper.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpires = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hasło zostało zresetowane." });
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var email = User.Identity?.Name;
            if (email == null) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized();

            if (!PasswordHelper.VerifyPassword(request.CurrentPassword, user.PasswordHash))
                return BadRequest("Nieprawidłowe aktualne hasło.");

            user.PasswordHash = PasswordHelper.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hasło zostało zmienione." });
        }
    }
}
