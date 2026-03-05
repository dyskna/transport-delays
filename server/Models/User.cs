using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public enum UserRole
    {
        Passenger,
        Moderator,
        Admin
    }

    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string? DisplayName { get; set; }
        public string? City { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public UserRole Role { get; set; } = UserRole.Passenger;
        public bool IsEmailConfirmed { get; set; } = false;
        public string? EmailConfirmationToken { get; set; }
        public DateTime? EmailConfirmationTokenExpires { get; set; }

        public int ReputationPoints { get; set; } = 0;
        public int ReportsCount { get; set; } = 0;

        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpires { get; set; }

        public List<Report> Reports { get; set; } = new();
        public List<Verification> Verifications { get; set; } = new();
    }
}
